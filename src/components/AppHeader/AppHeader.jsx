import { DatePicker, InputNumber, Menu, Select } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import './AppHeader.css';
const { Option } = Select;

const { RangePicker } = DatePicker;
const status = [0, 1, 2, 3, 4];

const AppHeader = ({ wbKeys = [], currentWbKey, setCurrentWbKey }) => {
  const handleChange = (value) => {
    setCurrentWbKey(value);
  };

  const [days, setDays] = useState();
  return (
    <div className={'wrapper'}>
      <div className="box">
        <div>{`Текущая дата: ${dayjs(new Date()).format(
          'DD.MM.YY HH.mm'
        )}`}</div>
        <div>Последнее обновление</div>
      </div>
      <div className="box">
        <RangePicker />
        <InputNumber min={1} value={days} onChange={setDays} />
      </div>
      <div className="box">
        <div>Надбавка 20%</div>
      </div>
      <div className="box">
        <div>Остатки на складе</div>
        <div className="progressWrapper">
          {status.map((item, i) => (
            <div key={i} className="progress"></div>
          ))}
        </div>
      </div>
      <div className="box">
        <Select
          defaultValue={currentWbKey}
          placeholder="wbKeys"
          style={{
            width: 120
          }}
          onChange={handleChange}
        >
          {wbKeys.map((item) => (
            <Option key={item.id} value={item.id}>
              {item.name}
            </Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default AppHeader;
