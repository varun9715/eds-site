import { describe, it, expect, beforeEach, vi } from 'vitest';
import decorate, {
  extractTableProperties,
  processCellSpans,
  calculateCellData,
} from './table.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

vi.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: vi.fn(() => {}),
}));

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => '__randomUUID__'),
});

describe('Table Block', () => {
  let mockBlock;

  beforeEach(() => {
    vi.clearAllMocks();

    mockBlock = document.createElement('div');
    mockBlock.innerHTML = `
      <div><div><p>Test Caption</p><p>true</p></div></div>
      <div><div><p>Alt for tick</p></div></div>
      <div><div><p>Alt for cross</p></div></div>
      <div><div><p>Alt for hyphen</p></div></div>
      <div>
        <div><p>Header 1</p></div>
        <div><p>Header 2</p></div>
        <div><p>Header 3</p></div>
      </div>
      <div>
        <div><p>Data 1</p></div>
        <div><p>Data 2</p></div>
        <div><p>Data 3</p></div>
      </div>
    `;
  });

  describe('extractTableProperties', () => {
    it('should extract table properties correctly', () => {
      const properties = extractTableProperties(mockBlock);
      expect(properties).toEqual({
        caption: 'Test Caption',
        showCaption: true,
        altTextTicks: 'Alt for tick',
        altTextCrosses: 'Alt for cross',
        altTextHyphens: 'Alt for hyphen',
      });
    });

    it('should handle hidden caption properly', () => {
      mockBlock.innerHTML = `
      <div><div><p>Hidden Caption</p></div></div>
      <div><div><p>Alt for tick</p></div></div>
      <div><div><p>Alt for cross</p></div></div>
      <div><div><p>Alt for hyphen</p></div></div>
      <div>
        <div><p>Header 1</p></div>
        <div><p>Header 2</p></div>
        <div><p>Header 3</p></div>
      </div>
      <div>
        <div><p>Data 1</p></div>
        <div><p>Data 2</p></div>
        <div><p>Data 3</p></div>
      </div>
    `;
      const properties = extractTableProperties(mockBlock);
      expect(properties).toEqual({
        caption: 'Hidden Caption',
        showCaption: false,
        altTextTicks: 'Alt for tick',
        altTextCrosses: 'Alt for cross',
        altTextHyphens: 'Alt for hyphen',
      });
    });

    it('should handle missing properties', () => {
      mockBlock.innerHTML = '<div></div>';
      const properties = extractTableProperties(mockBlock);
      expect(properties).toEqual({
        caption: '',
        showCaption: false,
        altTextTicks: '',
        altTextCrosses: '',
        altTextHyphens: '',
      });
    });
  });

  describe('processCellSpans', () => {
    it('should process column spans correctly', () => {
      const cells = [
        { textContent: 'A', dataset: {} },
        { textContent: 'A', dataset: {} },
        { textContent: 'B', dataset: {} },
        { textContent: 'B', dataset: {} },
      ];
      processCellSpans(cells, 'colspan');
      expect(cells[0].dataset.colspan).toBe('2');
      expect(cells[1].dataset.colspan).toBe('0');
      expect(cells[2].dataset.colspan).toBe('2');
      expect(cells[3].dataset.colspan).toBe('0');
    });

    it('should handle row spans with existing colspans', () => {
      const cells = [
        { textContent: 'A', dataset: { colspan: '2' } },
        { textContent: 'B', dataset: {} },
      ];
      processCellSpans(cells, 'rowspan');
      expect(cells[0].dataset.rowspan).toBe('1');
      expect(cells[1].dataset.rowspan).toBe('1');
    });
  });

  describe('calculateCellData', () => {
    it('should calculate spans for header rows and columns', () => {
      const rows = [
        {
          children: [
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
          ],
        },
        {
          children: [
            { textContent: 'Data', dataset: {} },
            { textContent: 'Data', dataset: {} },
          ],
        },
      ];
      calculateCellData(rows, 1, 0);
      expect(rows[0].children[0].dataset.colspan).toBe('2');
      expect(rows[0].children[1].dataset.colspan).toBe('0');
    });

    it('should not allow colspans across header column border', () => {
      const rows = [
        {
          children: [
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
          ],
        },
        {
          children: [
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
          ],
        },
        {
          children: [
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
            { textContent: 'Data', dataset: {} },
            { textContent: 'Data', dataset: {} },
          ],
        },
        {
          children: [
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
            { textContent: 'Data', dataset: {} },
            { textContent: 'Data', dataset: {} },
          ],
        },
      ];
      calculateCellData(rows, 2, 2);

      expect(rows[0].children[0].dataset.colspan).toBe('2');
      expect(rows[0].children[1].dataset.colspan).toBe('0');
      expect(rows[0].children[2].dataset.colspan).toBe('2');
      expect(rows[0].children[3].dataset.colspan).toBe('0');
      expect(rows[1].children[0].dataset.colspan).toBe('2');
      expect(rows[1].children[1].dataset.colspan).toBe('0');
      expect(rows[1].children[2].dataset.colspan).toBe('2');
      expect(rows[1].children[3].dataset.colspan).toBe('0');

      expect(rows[0].children[0].dataset.rowspan).toBe('2');
      expect(rows[0].children[1].dataset.rowspan).toBe('2');
      expect(rows[1].children[0].dataset.rowspan).toBe('0');
      expect(rows[1].children[1].dataset.rowspan).toBe('0');
      expect(rows[2].children[0].dataset.rowspan).toBe('2');
      expect(rows[2].children[1].dataset.rowspan).toBe('2');
      expect(rows[3].children[0].dataset.rowspan).toBe('0');
      expect(rows[3].children[1].dataset.rowspan).toBe('0');
    });

    it('should should force merge cells when 3 out of 4 corners have same content', () => {
      const rows = [
        {
          children: [
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
          ],
        },
        {
          children: [
            { textContent: 'Header', dataset: {} },
            { textContent: 'Something Different', dataset: {} },
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
          ],
        },
        {
          children: [
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
            { textContent: 'Data', dataset: {} },
            { textContent: 'Data', dataset: {} },
          ],
        },
        {
          children: [
            { textContent: 'Header', dataset: {} },
            { textContent: 'Header', dataset: {} },
            { textContent: 'Data', dataset: {} },
            { textContent: 'Data', dataset: {} },
          ],
        },
      ];
      calculateCellData(rows, 2, 2);

      expect(rows[0].children[0].dataset.colspan).toBe('2');
      expect(rows[0].children[0].dataset.rowspan).toBe('2');

      expect(rows[0].children[1].dataset.colspan).toBe('0');

      expect(rows[1].children[0].dataset.rowspan).toBe('0');

      expect(rows[1].children[1].dataset.colspan).toBe('0');
      expect(rows[1].children[1].dataset.rowspan).toBe('0');
    });

    describe('border style calculations', () => {
      it('should add border styles correctly for simple table with header column', () => {
        const rows = [
          {
            children: [
              { textContent: 'Header 1', dataset: {} },
              { textContent: 'Data 1', dataset: {} },
            ],
          },
          {
            children: [
              { textContent: 'Header 2', dataset: {} },
              { textContent: 'Data 2', dataset: {} },
            ],
          },
          {
            children: [
              { textContent: 'Header 3', dataset: {} },
              { textContent: 'Data 3', dataset: {} },
            ],
          },
        ];

        calculateCellData(rows, 0, 1);

        expect(rows[2].children[0].dataset.class).toContain('corner-bottom-left');
        expect(rows[2].children[0].dataset.class).toContain('header-column-cell');
        expect(rows[2].children[0].dataset.class).toContain('first-column-cell');
        expect(rows[2].children[0].dataset.class).toContain('header-column-cell-last');

        const cellsWithBottomLeftCorner = rows.flatMap((row) =>
          Array.from(row.children).filter((cell) =>
            (cell.dataset.class || '').includes('corner-bottom-left'),
          ),
        );
        expect(cellsWithBottomLeftCorner.length).toBe(1);
        const headerColumnCells = rows.flatMap((row) =>
          Array.from(row.children).filter((cell) =>
            (cell.dataset.class || '').includes('header-column-cell'),
          ),
        );
        expect(headerColumnCells.length).toBe(3);
      });

      it('should add border styles correctly for simple table with header row', () => {
        const rows = [
          {
            children: [
              { textContent: 'Header 1', dataset: {} },
              { textContent: 'Header 2', dataset: {} },
            ],
          },
          {
            children: [
              { textContent: 'Data 1', dataset: {} },
              { textContent: 'Data 2', dataset: {} },
            ],
          },
          {
            children: [
              { textContent: 'Data 3', dataset: {} },
              { textContent: 'Data 4', dataset: {} },
            ],
          },
        ];

        calculateCellData(rows, 1, 0);

        expect(rows[2].children[0].dataset.class).toContain('corner-bottom-left');

        const cellsWithBottomLeftCorner = rows.flatMap((row) =>
          Array.from(row.children).filter((cell) =>
            (cell.dataset.class || '').includes('corner-bottom-left'),
          ),
        );
        expect(cellsWithBottomLeftCorner.length).toBe(1);
        const headerColumnCells = rows.flatMap((row) =>
          Array.from(row.children).filter((cell) =>
            (cell.dataset.class || '').includes('header-column-cell'),
          ),
        );
        expect(headerColumnCells.length).toBe(0);
      });

      it('should add border styles correctly for simple table with header column and rowspan', () => {
        const rows = [
          {
            children: [
              { textContent: 'Header 1', dataset: {} },
              { textContent: 'Data 1', dataset: {} },
            ],
          },
          {
            children: [
              { textContent: 'Header 2', dataset: {} },
              { textContent: 'Data 2', dataset: {} },
            ],
          },
          {
            children: [
              { textContent: 'Header 2', dataset: {} },
              { textContent: 'Data 3', dataset: {} },
            ],
          },
        ];

        calculateCellData(rows, 0, 1);

        expect(rows[0].children[0].dataset.class).toContain('first-column-cell');
        expect(rows[1].children[0].dataset.class).toContain('corner-bottom-left');
        expect(rows[1].children[0].dataset.class).toContain('header-column-cell');
        expect(rows[1].children[0].dataset.class).toContain('first-column-cell');
        expect(rows[1].children[0].dataset.class).toContain('header-column-cell-last');

        const cellsWithBottomLeftCorner = rows.flatMap((row) =>
          Array.from(row.children).filter((cell) =>
            (cell.dataset.class || '').includes('corner-bottom-left'),
          ),
        );
        expect(cellsWithBottomLeftCorner.length).toBe(1);
        const headerColumnCells = rows.flatMap((row) =>
          Array.from(row.children).filter((cell) =>
            (cell.dataset.class || '').includes('header-column-cell'),
          ),
        );
        expect(headerColumnCells.length).toBe(3);
      });

      it('should add border styles correctly for simple table with no headers', () => {
        const rows = [
          {
            children: [
              { textContent: 'Header 1', dataset: {} },
              { textContent: 'Data 1', dataset: {} },
            ],
          },
          {
            children: [
              { textContent: 'Header 2', dataset: {} },
              { textContent: 'Data 2', dataset: {} },
            ],
          },
          {
            children: [
              { textContent: 'Header 3', dataset: {} },
              { textContent: 'Data 3', dataset: {} },
            ],
          },
        ];

        calculateCellData(rows, 0, 0);

        expect(rows[2].children[0].dataset.class).toContain('corner-bottom-left');

        const cellsWithBottomLeftCorner = rows.flatMap((row) =>
          Array.from(row.children).filter((cell) =>
            (cell.dataset.class || '').includes('corner-bottom-left'),
          ),
        );
        expect(cellsWithBottomLeftCorner.length).toBe(1);
        const headerColumnCells = rows.flatMap((row) =>
          Array.from(row.children).filter((cell) =>
            (cell.dataset.class || '').includes('header-column-cell'),
          ),
        );
        expect(headerColumnCells.length).toBe(0);

        const firstColumnCells = rows.flatMap((row) =>
          Array.from(row.children).filter((cell) =>
            (cell.dataset.class || '').includes('first-column-cell'),
          ),
        );
        expect(firstColumnCells.length).toBe(3);
      });

      it('should add border styles correctly for tables with both header row and header column', () => {
        const rows = [
          {
            children: [
              { textContent: '', dataset: {} },
              { textContent: 'Column A', dataset: {} },
              { textContent: 'Column B', dataset: {} },
            ],
          },
          {
            children: [
              { textContent: 'Row A', dataset: {} },
              { textContent: 'Data 1', dataset: {} },
              { textContent: 'Data 2', dataset: {} },
            ],
          },
          {
            children: [
              { textContent: 'Row B', dataset: {} },
              { textContent: 'Data 3', dataset: {} },
              { textContent: 'Data 4', dataset: {} },
            ],
          },
        ];

        calculateCellData(rows, 1, 1);

        expect(rows[2].children[0].dataset.class).toContain('corner-bottom-left');
        expect(rows[2].children[0].dataset.class).toContain('header-column-cell');
        expect(rows[2].children[0].dataset.class).toContain('first-column-cell');
        expect(rows[2].children[0].dataset.class).toContain('header-column-cell-last');

        expect(rows[0].children[0].dataset.class).toContain('corner-top-left');
        expect(rows[0].children[0].dataset.class).toContain('header-column-cell');
        expect(rows[0].children[0].dataset.class).toContain('first-column-cell');
        expect(rows[0].children[0].dataset.class).toContain('header-column-cell-last');

        const cellsWithBottomLeftCorner = rows.flatMap((row) =>
          Array.from(row.children).filter((cell) =>
            (cell.dataset.class || '').includes('corner-bottom-left'),
          ),
        );
        expect(cellsWithBottomLeftCorner.length).toBe(1);
        const headerColumnCells = rows.flatMap((row) =>
          Array.from(row.children).filter((cell) =>
            (cell.dataset.class || '').includes('header-column-cell'),
          ),
        );
        expect(headerColumnCells.length).toBe(3);
      });

      it('should add border styles correctly in a complex table structure', () => {
        const rows = [
          {
            children: [
              { textContent: '', dataset: {} },
              { textContent: '', dataset: {} },
              { textContent: 'Columnn A', dataset: {} },
              { textContent: 'Columnn B', dataset: {} },
            ],
          },
          {
            children: [
              { textContent: 'Header 1', dataset: {} }, // Same as above
              { textContent: 'Category 1', dataset: {} },
              { textContent: 'Data 1', dataset: {} },
              { textContent: 'Data 2', dataset: {} },
            ],
          },
          {
            children: [
              { textContent: 'Header 1', dataset: {} }, // Same as above
              { textContent: 'Category 2', dataset: {} },
              { textContent: 'Data 3', dataset: {} },
              { textContent: 'Data 4', dataset: {} },
            ],
          },
          {
            children: [
              { textContent: 'Header 1', dataset: {} },
              { textContent: 'Category 3', dataset: {} },
              { textContent: 'Data 8', dataset: {} },
              { textContent: 'Data 9', dataset: {} },
            ],
          },
        ];

        calculateCellData(rows, 1, 2);

        expect(rows[1].children[0].dataset.class).toContain('corner-bottom-left');
        expect(rows[1].children[0].dataset.class).toContain('header-column-cell');
        expect(rows[1].children[0].dataset.class).toContain('first-column-cell');

        expect(rows[0].children[0].dataset.class).toContain('corner-top-left');
        expect(rows[0].children[0].dataset.class).toContain('header-column-cell');
        expect(rows[0].children[0].dataset.class).toContain('first-column-cell');
        expect(rows[0].children[0].dataset.class).toContain('header-column-cell-last');

        expect(rows[0].children[1].dataset.class).toContain('header-column-cell');
        expect(rows[0].children[1].dataset.class).toContain('header-column-cell-last');

        const cellsWithBottomLeftCorner = rows.flatMap((row) =>
          Array.from(row.children).filter((cell) =>
            (cell.dataset.class || '').includes('corner-bottom-left'),
          ),
        );
        expect(cellsWithBottomLeftCorner.length).toBe(1);
        const headerColumnCells = rows.flatMap((row) =>
          Array.from(row.children).filter((cell) =>
            (cell.dataset.class || '').includes('header-column-cell'),
          ),
        );
        expect(headerColumnCells.length).toBe(8);
      });

      it('should handle styles correctly for 1x1 table', () => {
        const rows = [
          {
            children: [{ textContent: 'Header 1', dataset: {} }],
          },
        ];

        calculateCellData(rows, 1, 1);

        expect(rows[0].children[0].dataset.class).toContain('corner-bottom-left');
        expect(rows[0].children[0].dataset.class).toContain('header-column-cell');
      });
    });

    it('should correctly calculate header cell spans without crossing the header borders', () => {
      const rows = [
        {
          children: [
            { textContent: '', dataset: {} },
            { textContent: '', dataset: {} },
            { textContent: '', dataset: {} },
          ],
        },
        {
          children: [
            { textContent: '', dataset: {} },
            { textContent: '', dataset: {} },
            { textContent: '', dataset: {} },
          ],
        },
        {
          children: [
            { textContent: '', dataset: {} },
            { textContent: '', dataset: {} },
            { textContent: '', dataset: {} },
          ],
        },
        {
          children: [
            { textContent: '', dataset: {} },
            { textContent: '', dataset: {} },
            { textContent: '', dataset: {} },
          ],
        },
      ];

      calculateCellData(rows, 2, 1);

      // The first cell should span 1 column and 2 rows
      expect(rows[0].children[0].dataset.rowspan).toBe('2');
      expect(rows[0].children[0].dataset.colspan).toBe('1');
    });
  });

  describe('decorate', () => {
    it('should create table with header-first-row class', async () => {
      mockBlock.classList.add('header-first-row');
      await decorate(mockBlock);
      const table = mockBlock.querySelector('table');
      expect(table).toBeTruthy();
      expect(table.querySelector('thead')).toBeTruthy();
      expect(table.querySelector('tbody')).toBeTruthy();
    });

    it('should move instrumentation for each row', async () => {
      await decorate(mockBlock);
      expect(vi.mocked(moveInstrumentation).mock.calls.length).toBe(2);
    });

    it('should handle table with caption', async () => {
      await decorate(mockBlock);
      const table = mockBlock.querySelector('table');
      const caption = table.querySelector('caption');
      expect(caption).toBeTruthy();
      expect(caption.textContent).toBe('Test Caption');
    });

    it('should create correct cell structure with headers', async () => {
      mockBlock.classList.add('header-first-row', 'header-first-column');
      await decorate(mockBlock);
      const table = mockBlock.querySelector('table');
      const headers = table.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
      expect(headers[0].getAttribute('scope')).toBe('col');
    });

    it('should set correct alt text for tick icons in cells', async () => {
      mockBlock.innerHTML = `
        <div><div><p>Test Caption</p><p>true</p></div></div>
        <div><div><p>Alt for tick</p></div></div>
        <div><div><p>Alt for cross</p></div></div>
        <div><div><p>Alt for hyphen</p></div></div>
        <div>
          <div><p>Header 1</p></div>
          <div><p>Header 2</p></div>
          <div><p>Header 3</p></div>
        </div>
        <div>
          <div><p><span class="icon icon-runway_icon_tick_green60"><img data-icon-name="runway_icon_tick_green60" src="/icons/runway_icon_tick_green60.svg" alt="" loading="eager"></span></p></div>
          <div><p><span class="icon icon-runway_icon_cross_red70"><img data-icon-name="runway_icon_cross_red70" src="/icons/runway_icon_cross_red70.svg" alt="" loading="eager"></span></p></div>
          <div><p><span class="icon icon-runway_icon_minus"><img data-icon-name="runway_icon_minus" src="/icons/runway_icon_minus.svg" alt="" loading="eager"></span></p></div>
        </div>
      `;
      await decorate(mockBlock);
      const table = mockBlock.querySelector('table');
      const tickIcon = table.querySelector(
        'img[data-icon-name="runway_icon_tick_green60"]',
      );
      expect(tickIcon.getAttribute('alt')).toBe('Alt for tick');
      const crossIcon = table.querySelector(
        'img[data-icon-name="runway_icon_cross_red70"]',
      );
      expect(crossIcon.getAttribute('alt')).toBe('Alt for cross');
      const minusIcon = table.querySelector('img[data-icon-name="runway_icon_minus"]');
      expect(minusIcon.getAttribute('alt')).toBe('Alt for hyphen');
    });

    it('should match expected output', async () => {
      mockBlock.classList.add(
        'header-first-row',
        'header-second-row',
        'header-first-column',
        'header-second-column',
      );
      mockBlock.innerHTML = `
        <div><div><p>Test Caption</p><p>true</p></div></div>
        <div><div><p>Alt for tick</p></div></div>
        <div><div><p>Alt for cross</p></div></div>
        <div><div><p>Alt for hyphen</p></div></div>
        <div>
          <div><p></p></div>
          <div><p></p></div>
          <div><p>Colgroup 1</p></div>
          <div><p>Colgroup 1</p></div>
          <div><p>Colgroup 2</p></div>
          <div><p>Colgroup 2</p></div>
        </div>
        <div>
          <div><p></p></div>
          <div><p></p></div>
          <div><p>Col 1</p></div>
          <div><p>Col 2</p></div>
          <div><p>Col 3</p></div>
          <div><p>Col 4</p></div>
        </div>
        <div>        
          <div><p>Rowgroup 1</p></div>
          <div><p>Row 1</p></div>
          <div><p>Data 1</p></div>
          <div><p>Data 2</p></div>
          <div><p>Data 3</p></div>
          <div><p>Data 4</p></div>
        </div>
        <div>        
          <div><p>Rowgroup 1</p></div>
          <div><p>Row 2</p></div>
          <div><p>Data 5</p></div>
          <div><p>Data 6</p></div>
          <div><p>Data 7</p></div>
          <div><p>Data 8</p></div>
        </div>
        <div>        
          <div><p>Rowgroup 2</p></div>
          <div><p>Row 3</p></div>
          <div><p>Data 9</p></div>
          <div><p>Data 10</p></div>
          <div><p>Data 11</p></div>
          <div><p>Data 12</p></div>
        </div>
        <div>        
          <div><p>Rowgroup 2</p></div>
          <div><p>Row 4</p></div>
          <div><p>Data 13</p></div>
          <div><p>Data 14</p></div>
          <div><p>Data 15</p></div>
          <div><p>Data 16</p></div>
        </div>
      `;

      await decorate(mockBlock);
      await expect(mockBlock).toMatchFileSnapshot('./__snapshots__/table.test.html');
    });
  });
});
