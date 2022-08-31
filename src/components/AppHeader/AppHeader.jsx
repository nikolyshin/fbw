import { DatePicker, InputNumber, Menu, Select } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import './AppHeader.css';
import moment from 'moment';
const { Option } = Select;

const { RangePicker } = DatePicker;
const status = [0, 1, 2, 3, 4];

const AppHeader = ({
  wbKeys = [],
  currentWbKey,
  setCurrentWbKey,
  date,
  setDate
}) => {
  const dateFormat = 'DD-MM-YYYY';

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
        <RangePicker
          defaultValue={[
            date ? moment(date[0], dateFormat) : null,
            date ? moment(date[1], dateFormat) : null
          ]}
          format={dateFormat}
          onChange={setDate}
          placeholder={['Дата старта', 'Дата конца']}
        />
        <div className="title">
          Планируем поставку на:{' '}
          <InputNumber min={1} value={days} onChange={setDays} />
        </div>
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
          mode="multiple"
          showArrow
          defaultValue={currentWbKey}
          placeholder="wbKeys"
          style={{
            width: 300
          }}
          onChange={setCurrentWbKey}
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
