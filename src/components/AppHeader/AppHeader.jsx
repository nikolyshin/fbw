import {
  DatePicker,
  InputNumber,
  Dropdown,
  Menu,
  Space,
  Typography
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import './AppHeader.css';

const { RangePicker } = DatePicker;
const status = [0, 1, 2, 3, 4];

const AppHeader = ({ wbKeys, currentWbKey, setCurrentWbKey }) => {
  const menu = useMemo(() => {
    if (!!wbKeys?.length) {
      return (
        <Menu
          selectable
          defaultSelectedKeys={[`${currentWbKey}`]}
          items={wbKeys.map((item) => {
            return {
              key: item.id,
              label: item.name,
              onClick: () => {
                setCurrentWbKey(item.id);
              }
            };
          })}
        />
      );
    }
  }, [wbKeys]);

  const { days, setDays } = useState();
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
          {status.map((item) => (
            <div className="progress"></div>
          ))}
        </div>
      </div>
      <div className="box">
        <Dropdown overlay={menu}>
          <Typography.Link>
            <Space>
              wbKeys
              <DownOutlined />
            </Space>
          </Typography.Link>
        </Dropdown>
      </div>
    </div>
  );
};

export default AppHeader;
