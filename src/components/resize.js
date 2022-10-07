const handleResize =
  ({ columns, setColumns, index }) =>
  (_, { size }) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], width: size.width };
    setColumns(newColumns);
  };

export const resize = ({ columns = [], setColumns }) =>
  columns.map((col, index) => ({
    ...col,
    onHeaderCell: (column) => ({
      width: column.width,
      onResize: handleResize({ index, columns, setColumns })
    })
  }));
