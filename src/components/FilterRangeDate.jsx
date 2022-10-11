import { Button, DatePicker, Space } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

const FilterRangeDate = ({
  selectedKeys,
  setSelectedKeys,
  confirm,
  clearFilters,
  min,
  max
}) => {
  const [value, setValue] = useState(selectedKeys);

  useEffect(() => {
    setValue(selectedKeys);
  }, [selectedKeys]);

  return (
    <div
      style={{
        padding: 8
      }}
    >
      <Space direction="vertical">
        <RangePicker
          value={[
            value[0] ? moment(value[0], dateFormat) : null,
            value[1] ? moment(value[1], dateFormat) : null
          ]}
          disabledDate={(current) => {
            return (
              current < moment(min, dateFormat) ||
              current > moment(max, dateFormat)
            );
          }}
          format={dateFormat}
          onChange={setValue}
          placeholder={['Дата старта', 'Дата конца']}
        />
        <Space>
          <Button
            size="small"
            onClick={() => {
              clearFilters();
            }}
          >
            Очистить
          </Button>
          <Button
            size="small"
            onClick={() => {
              setSelectedKeys(value);
              confirm({
                closeDropdown: true
              });
            }}
          >
            Применить
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default FilterRangeDate;
