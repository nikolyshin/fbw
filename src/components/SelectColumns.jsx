import { Select } from 'antd';
import React from 'react';
const { Option } = Select;

const SelectColumns = ({
  columnsAll,
  columnsSelect,
  setColumnsSelect,
  loading
}) => {
  return (
    <Select
      mode="multiple"
      loading={loading}
      allowClear
      showArrow
      value={columnsSelect.map((item) => item.dataIndex)}
      placeholder="Выбрать колонку"
      style={{
        width: '100%',
        fontSize: '13px',
        marginBottom: '24px'
      }}
      onChange={(value) => {
        if (value.includes('all')) {
          setColumnsSelect(columnsAll);
        } else if (value.includes('none')) {
          setColumnsSelect([]);
        } else {
          let items = columnsAll.filter((item) =>
            value.includes(item.dataIndex)
          );

          setColumnsSelect(items);
        }
      }}
    >
      <Option
        style={{
          fontSize: '13px'
        }}
        value="all"
      >
        Выбрать все
      </Option>
      <Option
        style={{
          fontSize: '13px'
        }}
        value="none"
      >
        Снять все
      </Option>

      {columnsAll.map((item) => (
        <Option
          style={{
            fontSize: '13px'
          }}
          key={item.dataIndex}
          value={item.dataIndex}
        >
          {item.title}
        </Option>
      ))}
    </Select>
  );
};

export default SelectColumns;
