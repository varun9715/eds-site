import decorate from './table.js';
import '../../styles/styles.css';
import './table.css';

// Define all table data sets
const tableDataSets = {
  basic: {
    name: 'Basic 4x4 Table',
    data: [
      ['Header 1', 'Header 2', 'Header 3', 'Header 4'],
      ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3', 'Row 1 Col 4'],
      ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3', 'Row 2 Col 4'],
      ['Row 3 Col 1', 'Row 3 Col 2', 'Row 3 Col 3', 'Row 3 Col 4'],
    ],
  },
  marketplaceVsShopping: {
    name: 'Irregular Dataset 1: Marketplace vs Shopping',
    data: [
      ['', 'Marketplace', 'Marketplace', 'Shopping', 'Shopping'],
      ['', 'Produced', 'Sold', 'Produced', 'Sold'],
      ['Teddy Bears', '50,000', '30,000', '100,000', '8,000'],
      ['Board Games', '10,000', '5,000', '12,000', '9,000'],
    ],
  },
  posterAvailability: {
    name: 'Irregular Dataset 2: Poster Availability',
    data: [
      ['Poster name', 'Colour', 'Sizes available', 'Sizes available', 'Sizes available'],
      ['Zodiac', 'Full colour', 'A2', 'A3', 'A4'],
      ['Zodiac', 'Black and white', 'A1', 'A2', 'A3'],
      ['Zodiac', 'Sepia', 'A3', 'A4', 'A5'],
      ['Cyberpunk', 'Black and white', 'A1', 'A3', 'A4'],
      ['Cyberpunk', 'Sepia', 'A2', 'A3', 'A5'],
    ],
  },
};

export default {
  title: 'Blocks/Table',
  argTypes: {
    tableData: {
      control: {
        type: 'select',
        labels: Object.fromEntries(
          Object.entries(tableDataSets).map(([key, value]) => [key, value.name]),
        ),
      },
      options: Object.keys(tableDataSets),
      mapping: tableDataSets,
      defaultValue: 'basic',
      description: 'Select table data set',
    },
    headerRows: {
      control: { type: 'select' },
      options: [0, 1, 2],
      defaultValue: 1,
      description: 'Number of header rows (0, 1, or 2)',
    },
    headerColumns: {
      control: { type: 'select' },
      options: [0, 1, 2],
      defaultValue: 0,
      description: 'Number of header columns (0, 1, or 2)',
    },
    striped: {
      control: 'boolean',
      defaultValue: false,
      description: 'Enable zebra/striped styling',
    },
    caption: {
      control: 'text',
      defaultValue: 'Sample Table Caption',
      description: 'Table caption',
    },
    showCaption: {
      control: 'boolean',
      defaultValue: false,
      description: 'Show the caption in the UI',
    },
  },
};

const Template = (args) => {
  const main = document.createElement('main');
  document.body.append(main);

  const section = document.createElement('div');
  section.classList.add('section');

  const block = document.createElement('div');
  block.classList.add('table');
  block.classList.add('block');

  // Add classes based on args
  if (args.headerRows >= 1) {
    block.classList.add('header-first-row');
  }
  if (args.headerRows >= 2) {
    block.classList.add('header-second-row');
  }
  if (args.headerColumns >= 1) {
    block.classList.add('header-first-column');
  }
  if (args.headerColumns >= 2) {
    block.classList.add('header-second-column');
  }
  if (args.striped) {
    block.classList.add('striped');
  }

  // Table properties structure (first 4 rows)
  const captionRow = document.createElement('div');
  captionRow.innerHTML = `
    <div>
      <p>${args.caption}</p>
      ${args.showCaption ? '<p>true</p>' : ''}
    </div>
  `;

  const altTextTicksRow = document.createElement('div');
  altTextTicksRow.innerHTML = `
    <div>
      <p>Available</p>
    </div>
  `;

  const altTextCrossesRow = document.createElement('div');
  altTextCrossesRow.innerHTML = `
    <div>
      <p>Not Available</p>
    </div>
  `;

  const altTextHyphensRow = document.createElement('div');
  altTextHyphensRow.innerHTML = `
    <div>
      <p>Not Applicable</p>
    </div>
  `;

  block.appendChild(captionRow);
  block.appendChild(altTextTicksRow);
  block.appendChild(altTextCrossesRow);
  block.appendChild(altTextHyphensRow);

  const selectedDataSet = args.tableData;
  const tableData = selectedDataSet.data;

  tableData.forEach((rowData) => {
    const row = document.createElement('div');
    rowData.forEach((cellData) => {
      const cell = document.createElement('div');
      cell.innerHTML = `<p>${cellData}</p>`;
      row.appendChild(cell);
    });
    block.appendChild(row);
  });

  section.appendChild(block);
  main.appendChild(section);

  decorate(block);
  return main;
};

export const Default = Template.bind({});
Default.args = {
  tableData: 'basic',
  headerRows: 1,
  headerColumns: 0,
  striped: false,
  caption: 'Sample Table Caption',
  showCaption: true,
};

export const WithHeaderColumnAndRow = Template.bind({});
WithHeaderColumnAndRow.args = {
  tableData: 'basic',
  headerRows: 1,
  headerColumns: 1,
  striped: false,
  caption: 'Table with Header Row and Column',
  showCaption: true,
};

export const StripedTable = Template.bind({});
StripedTable.args = {
  tableData: 'basic',
  headerRows: 1,
  headerColumns: 0,
  striped: true,
  caption: 'Striped Table Example',
  showCaption: true,
};

export const DoubleHeaders = Template.bind({});
DoubleHeaders.args = {
  tableData: 'basic',
  headerRows: 2,
  headerColumns: 2,
  striped: true,
  caption: 'Table with Double Headers',
  showCaption: true,
};

export const NoHeaders = Template.bind({});
NoHeaders.args = {
  tableData: 'basic',
  headerRows: 0,
  headerColumns: 0,
  striped: false,
  caption: 'Table with No Headers',
  showCaption: true,
};

export const IrregularTable1 = Template.bind({});
IrregularTable1.args = {
  tableData: 'marketplaceVsShopping',
  headerRows: 2,
  headerColumns: 1,
  striped: false,
  caption: 'Marketplace vs Shopping Data',
  showCaption: true,
};

export const IrregularTable2 = Template.bind({});
IrregularTable2.args = {
  tableData: 'posterAvailability',
  headerRows: 1,
  headerColumns: 2,
  striped: true,
  caption: 'Poster Availability by Size',
  showCaption: true,
};
