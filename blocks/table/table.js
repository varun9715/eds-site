import { moveInstrumentation } from '../../scripts/scripts.js';
import { getTextContent, createElementWithClasses } from '../../scripts/utils/dom.js';

/**
 * Extracts table properties from the first row of a table block
 * @param {Element} block - The block element
 * @returns {Object} An object containing table properties:
 *   - caption: The table caption text
 *   - showCaption: Whether to show the caption in the UI
 *   - altTextTicks: Alternative text for tick marks
 *   - altTextCrosses: Alternative text for cross marks
 *   - altTextHyphens: Alternative text for hyphen marks
 */
export function extractTableProperties(block) {
  const [caption, altTextTicks, altTextCrosses, altTextHyphens] = [...block.children].map(
    (child) => child?.children[0],
  );
  const showCaption = getTextContent(caption?.children[1]) === 'true';
  const captionText = caption?.children[0]
    ? getTextContent(caption?.children[0])
    : getTextContent(caption);

  return {
    caption: captionText,
    showCaption,
    altTextTicks: getTextContent(altTextTicks),
    altTextCrosses: getTextContent(altTextCrosses),
    altTextHyphens: getTextContent(altTextHyphens),
  };
}

/**
 * Identifies matching content and sets the data attribute for the spanType
 * @param {Element[]} cells - Array of cell elements
 * @param {string} spanType - Type of span to calculate ('colspan' or 'rowspan')
 */
export function processCellSpans(cells, spanType) {
  let currentCell = 0;
  let endSpan = false;
  let currentSpan = 1;
  let currentText = '';

  cells.forEach((cell, index) => {
    const cellText = cell.textContent.trim();
    const cellHasEndSpan = cell.dataset[`end${spanType}`];

    if (index === 0) {
      currentText = cellText;
      endSpan = cellHasEndSpan;
      return;
    }

    if (!endSpan && cellText === currentText) {
      cell.dataset[spanType] = '0';
      currentSpan += 1;
      endSpan = cellHasEndSpan;
    } else {
      cells[currentCell].dataset[spanType] = currentSpan.toString();
      currentSpan = 1;
      currentText = cellText;
      currentCell = index;
      endSpan = cellHasEndSpan;
    }
  });

  cells[currentCell].dataset[spanType] = currentSpan.toString();
}

/**
 * Adds a class to the cell's data-class attribute
 * @param {Element} cell - The cell element
 * @param {string} className - The class to add
 */
function addToCellClasses(cell, className) {
  const existingClass = cell.dataset.class || '';
  if (!existingClass.split(' ').includes(className)) {
    cell.dataset.class = `${existingClass} ${className}`.trim();
  }
}

/**
 * Calculates column and row spans data attributes for table cells
 * @param {Element[]} rows - Array of row elements to process
 * @param {number} numHeaderRows - Number of header rows to process
 * @param {number} numHeaderCols - Number of header columns to process
 */
export function calculateCellData(rows, numHeaderRows = 1, numHeaderCols = 1) {
  if (rows.length === 0) {
    return;
  }

  // Transpose rows into columns for processing
  const columns = Array.from({ length: rows[0]?.children.length || 0 }, () => []);
  rows.forEach((row) => {
    [...row.children].forEach((cell, i) => {
      columns[i].push(cell);
    });
  });
  const headerColumns = [...columns].slice(0, numHeaderCols);

  // Mark cells to prevent merging across the header column border
  if (numHeaderRows > 0 && numHeaderCols > 0) {
    if (rows.length >= numHeaderRows) {
      [...rows[numHeaderRows - 1].children].forEach((cell) => {
        cell.dataset.endrowspan = '1';
      });
    }
    if (headerColumns.length >= numHeaderCols) {
      headerColumns[numHeaderCols - 1].forEach((cell) => {
        cell.dataset.endcolspan = '1';
      });
    }
  }

  // Calculate colspans and rowspans
  headerColumns.slice(0, numHeaderCols).forEach((column) => {
    processCellSpans(column, 'rowspan');
  });
  rows.slice(0, numHeaderRows).forEach((row) => {
    processCellSpans([...row.children], 'colspan');
  });

  // Edge case when 3 out of 4 cells have same content force merge.
  if (
    numHeaderRows === 2 &&
    numHeaderCols === 2 &&
    rows[0].children[0].dataset.colspan === '2' &&
    rows[0].children[0].dataset.rowspan === '2'
  ) {
    rows[1].children[1].dataset.colspan = '0';
    rows[1].children[1].dataset.rowspan = '0';
  }

  // Mark cells with classes for easier styling and when it cannot be targetted by CSS
  const firstColumn = columns[0];
  // Iterate from last to first to find the first non-zero rowspan
  for (let i = firstColumn.length - 1; i >= 0; i -= 1) {
    const cell = firstColumn[i];
    const { rowspan } = cell.dataset;
    if (rowspan !== '0') {
      addToCellClasses(cell, 'corner-bottom-left');
      break;
    }
  }

  firstColumn.forEach((cell) => {
    addToCellClasses(cell, 'first-column-cell');
  });

  const firstRow = rows[0]?.children || [];
  if (firstRow.length > 0) {
    addToCellClasses(firstRow[0], 'corner-top-left');
    // Iterate from last to first to find the first non-zero rowspan
    for (let i = firstRow.length - 1; i >= 0; i -= 1) {
      const cell = firstRow[i];
      const { colspan } = cell.dataset;
      if (colspan && colspan !== '0') {
        addToCellClasses(cell, 'corner-top-right');
        break;
      }
    }
    addToCellClasses(firstRow[firstRow.length - 1], 'corner-top-right');
  }
  const lastRow = rows[rows.length - 1]?.children || [];
  if (lastRow.length > 0) {
    addToCellClasses(lastRow[lastRow.length - 1], 'corner-bottom-right');
  }

  // Mark cells in header columns
  headerColumns.forEach((column, index) => {
    column.forEach((cell, i) => {
      addToCellClasses(cell, 'header-column-cell');

      // Cells in or spanning last column
      if (
        index === numHeaderCols - 1 ||
        cell.dataset.colspan === numHeaderCols.toString()
      ) {
        addToCellClasses(cell, 'header-column-cell-last');
      }
      // Cells in first column part of rowspan
      if (index === 1) {
        const rowspan = parseInt(cell.dataset.rowspan, 10) || 1;
        if (rowspan > 1) {
          for (let j = 1; j < rowspan; j += 1) {
            const rowSpanCell = headerColumns[0][i + j];
            addToCellClasses(rowSpanCell, 'in-rowspan');
          }
        }
      }
    });
  });
}

/**
 * Sets alt text on all icon images in the block based on their name
 * @param {Element} block - The block element
 * @param {Object} properties - Table properties containing alt text values
 */
function setIconAltText(block, properties) {
  const icons = block.querySelectorAll('img[data-icon-name]');
  icons.forEach((icon) => {
    const iconName = icon.getAttribute('data-icon-name');
    if (iconName.includes('_tick_') || iconName.includes('_tick')) {
      icon.setAttribute('alt', properties.altTextTicks);
    } else if (iconName.includes('_cross_') || iconName.includes('_cross')) {
      icon.setAttribute('alt', properties.altTextCrosses);
    } else if (iconName.includes('_minus_') || iconName.includes('_minus')) {
      icon.setAttribute('alt', properties.altTextHyphens);
    }
  });
}

/**
 * Adds wrapper divs to the block to handle scrolling related changes.
 * @param {Element} block - The block element
 */
function addWrapperDivs(block) {
  const top = createElementWithClasses('div', 'table-top');
  block.prepend(top);
}

/**
 * Modifies styles of the block when header rows are frozen.
 * Mostly applies scrolling related changes which cannot be achieved using CSS.
 * @param {Element} block - The block element
 */
function addVerticalScrollEffects(block) {
  if (!block.classList.contains('freeze-header-row')) {
    return;
  }

  const thead = block.querySelector('thead');
  const tbody = block.querySelector('tbody');
  if (!thead || !tbody) {
    return;
  }

  const setStyles = () => {
    const theadBottom = thead.offsetTop + thead.offsetHeight;
    const tbodyTop = tbody.offsetParent.offsetTop + tbody.offsetTop;
    const displayShadow = tbodyTop < theadBottom;

    thead.classList.toggle('is-pinned', displayShadow);
  };

  let animationFrameId = null;
  const throttledSetStyles = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(setStyles);
  };

  const observer = new IntersectionObserver(() => throttledSetStyles(), {
    root: null,
    rootMargin: '0px',
    threshold: [0, 1],
  });
  observer.observe(block.querySelector('.table-top'));
}

/**
 * Modifies styles of the block when header columns are frozen.
 * Mostly applies scrolling and irregular tables related changes which cannot be targeted using CSS.
 * @param {Element} block - The block element
 */
function addHorizontalScrollEffects(block) {
  const table = block.querySelector('table');
  const hasFrozenHeaderColumn = block.classList.contains('freeze-header-column') && table;

  const secondColThCells = hasFrozenHeaderColumn
    ? table.querySelectorAll('tr th.header-column-cell:nth-child(2)')
    : null;

  const applyStyleClasses = () => {
    // We add a buffer to hide the shadow when the user has reached the table edge
    const scrollRightBuffer = 2;

    const { scrollLeft, scrollWidth, clientWidth } = block;
    const canScrollLeft = scrollLeft > 0;
    const canScrollRight = scrollLeft + scrollRightBuffer < scrollWidth - clientWidth;
    const hasHorizontalOverflow = scrollWidth > clientWidth;

    block.classList.toggle('has-scroll-left', canScrollLeft);
    block.classList.toggle('has-scroll-right', canScrollRight);
    block.classList.toggle('has-horizontal-overflow', hasHorizontalOverflow);

    if (hasHorizontalOverflow) {
      block.setAttribute('tabindex', '0');
      block.setAttribute('role', 'group');
      block.setAttribute('aria-labelledby', block.querySelector('caption')?.id);
    } else {
      block.removeAttribute('tabindex');
      block.removeAttribute('role');
      block.removeAttribute('aria-labelledby');
    }
  };

  const handleResize = () => {
    applyStyleClasses();

    // Dynamically set the left position of the second row cells in case of resize
    secondColThCells?.forEach((cell) => {
      const previousTh = cell.previousElementSibling;
      if (previousTh) {
        cell.style.left = `${previousTh.offsetWidth}px`;

        const previousThRowspan = parseInt(previousTh.getAttribute('rowspan'), 10) || 1;

        if (previousThRowspan > 1) {
          let currentRow = cell.closest('tr');
          for (let i = 1; i < previousThRowspan; i += 1) {
            const nextRow = currentRow.nextElementSibling;
            if (nextRow) {
              const firstCellInNextRow = nextRow.firstElementChild;
              if (firstCellInNextRow) {
                firstCellInNextRow.style.left = `${previousTh.offsetWidth}px`;
              }
              currentRow = nextRow;
            }
          }
        }
      }
    });
  };

  let resizeAnimationFrameId = null;
  const throttledHandleResize = () => {
    if (resizeAnimationFrameId) {
      cancelAnimationFrame(resizeAnimationFrameId);
    }
    resizeAnimationFrameId = requestAnimationFrame(handleResize);
  };

  let scrollAnimationFrameId = null;
  const throttledHandleScroll = () => {
    if (scrollAnimationFrameId) {
      cancelAnimationFrame(scrollAnimationFrameId);
    }
    scrollAnimationFrameId = requestAnimationFrame(applyStyleClasses);
  };

  block.addEventListener('scroll', throttledHandleScroll);
  window.addEventListener('resize', throttledHandleResize);
  const observer = new IntersectionObserver(() => throttledHandleResize(), {
    root: null,
    rootMargin: '0px',
    threshold: [0, 1],
  });
  observer.observe(block.querySelector('.table-top'));
}

/**
 * Modifies styles of the block when header rows or columns are frozen.
 * @param {Element} block - The block element
 */
function addScrollEffects(block) {
  addWrapperDivs(block);
  addVerticalScrollEffects(block);
  addHorizontalScrollEffects(block);
}

/**
 * Creates and configures the table caption
 * @param {Element} block - The block element
 * @param {Object} properties - Table properties containing caption information
 * @param {Element} table - The table element
 */
function decorateCaption(block, properties, table) {
  const caption = createElementWithClasses('caption', 'caption');
  caption.id = crypto.randomUUID();
  table.append(caption);
  if (properties.caption) {
    caption.textContent = properties.caption;
    if (block.dataset.aueLabel) {
      block.dataset.aueLabel = `${block.dataset.aueLabel}: ${properties.caption}`;
      const captionElement = block.children[0].querySelector('p');
      if (captionElement) {
        moveInstrumentation(captionElement, caption);
      }
    }
  }
  if (properties.showCaption) {
    block.classList.add('show-caption');
  }
}

/**
 * Determines header configuration based on block classes
 * @param {Element} block - The block element
 * @returns {Object} Header configuration with row and column counts
 */
function getHeaderConfig(block) {
  const headerFirstRow = block.classList.contains('header-first-row');
  const headerSecondRow = headerFirstRow && block.classList.contains('header-second-row');
  const headerFirstCol = block.classList.contains('header-first-column');
  const headerSecondCol =
    headerFirstCol && block.classList.contains('header-second-column');

  let headerRows = headerFirstRow ? 1 : 0;
  let headerCols = headerFirstCol ? 1 : 0;
  if (headerSecondRow) {
    headerRows = 2;
  }
  if (headerSecondCol) {
    headerCols = 2;
  }

  return {
    headerFirstRow,
    headerSecondRow,
    headerFirstCol,
    headerSecondCol,
    headerRows,
    headerCols,
  };
}

/**
 * Creates colgroup elements for table structure
 * @param {Element[]} rows - Array of row elements
 * @param {boolean} headerFirstRow - Whether first row is header
 * @param {Element} table - The table element
 */
function decorateTableColumns(rows, headerFirstRow, table) {
  if (headerFirstRow && rows.length > 0) {
    const firstRow = rows[0];
    [...firstRow.children].forEach((cell) => {
      const span = cell.dataset.colspan;
      if (span === '1') {
        table.append(document.createElement('col'));
      } else if (span !== '0') {
        const colgroup = document.createElement('colgroup');
        colgroup.setAttribute('span', span);
        table.append(colgroup);
      }
    });
  }
}

/**
 * Creates a table cell (th or td) with appropriate attributes
 * @param {Element} cell - The original cell element
 * @param {number} rowNo - Row index
 * @param {number} colNo - Column index
 * @param {Object} headerConfig - Header configuration object
 * @returns {Element} The created table cell
 */
function decorateTableCell(cell, rowNo, colNo, headerConfig) {
  const { headerFirstRow, headerSecondRow, headerFirstCol, headerSecondCol } =
    headerConfig;

  const isHeader =
    (rowNo === 0 && headerFirstRow) ||
    (rowNo === 1 && headerSecondRow) ||
    (colNo === 0 && headerFirstCol) ||
    (colNo === 1 && headerSecondCol);

  if (cell.dataset.colspan === '0' || cell.dataset.rowspan === '0') {
    return null;
  }

  const forceTd = rowNo === 0 && colNo === 0 && cell.textContent.trim() === '';
  const td = document.createElement(isHeader && !forceTd ? 'th' : 'td');

  if (isHeader) {
    if (cell.dataset.rowspan && cell.dataset.rowspan !== '1') {
      td.setAttribute('rowspan', cell.dataset.rowspan);
      cell.dataset.scope = 'rowgroup';
    }
    if (cell.dataset.colspan && cell.dataset.colspan !== '1') {
      td.setAttribute('colspan', cell.dataset.colspan);
      cell.dataset.scope = 'colgroup';
    }
    if (!forceTd) {
      if (!cell.dataset.scope) {
        if ((rowNo === 0 && headerFirstRow) || (rowNo === 1 && headerSecondRow)) {
          cell.dataset.scope = 'col';
        } else if ((colNo === 0 && headerFirstCol) || (colNo === 1 && headerSecondCol)) {
          cell.dataset.scope = 'row';
        }
      }
      td.setAttribute('scope', cell.dataset.scope);
    }
  }

  if (cell.dataset.class) {
    td.className = cell.dataset.class;
  }

  td.innerHTML = cell.innerHTML;
  return td;
}

/**
 * Creates table rows and adds them to thead or tbody
 * @param {Element[]} rows - Array of row elements
 * @param {Object} headerConfig - Header configuration object
 * @param {Element} thead - The thead element
 * @param {Element[]} tbodyElements - An array for storing tbody elements
 */
function decorateTableRows(rows, headerConfig, thead, tbodyElements) {
  const { headerFirstRow, headerSecondRow } = headerConfig;

  let tbody = document.createElement('tbody');
  let inRowGroup = false;

  rows.forEach((row, rowNo) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);

    [...row.children].forEach((cell, colNo) => {
      const td = decorateTableCell(cell, rowNo, colNo, headerConfig);
      if (td) {
        tr.append(td);
      }
    });

    if ((rowNo === 0 && headerFirstRow) || (rowNo === 1 && headerSecondRow)) {
      thead.append(tr);
    } else {
      // Check if this row starts a new group based on rowspan in first column
      const firstCell = row.children[0];
      const rowspan = parseInt(firstCell?.dataset?.rowspan, 10) || 0;

      if (rowspan > 1) {
        // Start a new tbody if the first cell is the start of a rowgroup
        if (tbody.children.length > 0) {
          tbodyElements.push(tbody);
        }
        tbody = document.createElement('tbody');
        inRowGroup = true;
      } else if (rowspan === 1 && inRowGroup) {
        // End the tbody for the previous rowgroup and start a new one
        tbodyElements.push(tbody);
        tbody = document.createElement('tbody');
        inRowGroup = false;
      }

      tbody.append(tr);
    }
  });

  if (tbody.children.length > 0) {
    tbodyElements.push(tbody);
  }
}

export default async function decorate(block) {
  const table = createElementWithClasses('table', 'body-02');
  const thead = document.createElement('thead');
  const headerConfig = getHeaderConfig(block);
  const { headerFirstRow } = headerConfig;

  const properties = extractTableProperties(block);
  setIconAltText(block, properties);

  decorateCaption(block, properties, table);

  const rows = [...block.children].slice(4);
  calculateCellData(rows, headerConfig.headerRows, headerConfig.headerCols);
  decorateTableColumns(rows, headerFirstRow, table);
  const tbodyElements = [];
  decorateTableRows(rows, headerConfig, thead, tbodyElements);

  if (headerFirstRow) {
    table.append(thead);
  }
  table.append(...tbodyElements);
  block.replaceChildren(table);

  addScrollEffects(block);
}
