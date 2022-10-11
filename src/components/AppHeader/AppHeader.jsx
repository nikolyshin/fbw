import { Button, DatePicker, InputNumber, Select } from 'antd';
import dayjs from 'dayjs';
import './AppHeader.css';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { fetchWarehousesCreateIncomes } from '../../api';
import { useState } from 'react';
import ModalSuccess from '../ModalSuccess';
import ModalError from '../ModalError';
const { Option } = Select;

const { RangePicker } = DatePicker;
const status = [0, 1, 2, 3, 4];

const AppHeader = ({
  wbKeys = [],
  currentWbKey,
  setCurrentWbKey,
  planIncomes,
  setPlanIncomes,
  setChangeIncome,
  date,
  setDate
}) => {
  const dateFormat = 'DD-MM-YYYY';
  let router = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalSuccessVisible, setIsModalSuccessVisible] = useState(false);
  const [isModalErrorVisible, setIsModalErrorVisible] = useState(false);
  const hideElements = () => {
    return !['/goodlist', '/', '/delivery'].includes(router.pathname);
  };

  const createIncomes = async () => {
    let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
    try {
      setLoading(true);
      const res = await fetchWarehousesCreateIncomes(incomes);
      if (res) {
        localStorage.removeItem('incomes');
        setIsModalSuccessVisible(true);
        setChangeIncome(true);
      } else {
        setIsModalErrorVisible(true);
        setError(res?.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

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
        {hideElements() && (
          <div className="title">
            Планируем поставку на:{' '}
            <InputNumber
              type="number"
              min={0}
              value={planIncomes}
              onBlur={(e) => {
                setPlanIncomes(e.target.value);
              }}
              onPressEnter={(e) => {
                setPlanIncomes(e.target.value);
              }}
            />
          </div>
        )}
      </div>
      {hideElements() && (
        <div className="box">
          <div>Надбавка 20%</div>
        </div>
      )}
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
        {['/stats'].includes(router.pathname) && (
          <Button type="primary" htmlType="submit" onClick={createIncomes}>
            Создать отгрузку
          </Button>
        )}
        <ModalSuccess
          show={isModalSuccessVisible}
          setShow={setIsModalSuccessVisible}
          title="Отгрузка успешно создана"
        />
        <ModalError
          show={isModalErrorVisible}
          setShow={setIsModalErrorVisible}
          title="Произошла ошибка"
        />
      </div>
    </div>
  );
};

export default AppHeader;
