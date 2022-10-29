import { Select } from 'antd';
import React from 'react';
const { Option } = Select;

const SelectColumns = ({ columnsAll, columnsSelect, setColumnsSelect }) => {
  return (
    <Select
      mode="multiple"
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
        setColumnsSelect([
          ...columnsAll.filter((item) => value.includes(item.dataIndex))
        ]);
      }}
    >
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
