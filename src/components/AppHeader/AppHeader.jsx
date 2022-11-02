import { Button, DatePicker, InputNumber, Popover, Select } from 'antd';
import dayjs from 'dayjs';
import './AppHeader.css';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import {
  fetchGetCompaniesLimits,
  fetchGetDataImportStatus,
  fetchSetCompaniesLimits,
  fetchWarehousesCreateIncomes,
  fetchGetCompaniesSurcharge
} from '../../api';
import { useEffect, useState } from 'react';
import ModalSuccess from '../ModalSuccess';
import ModalError from '../ModalError';
import { dateFormatReverse } from '../helpers';
const { Option } = Select;

const { RangePicker } = DatePicker;

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
  let router = useLocation();
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState([]);
  const [isModalSuccessVisible, setIsModalSuccessVisible] = useState(false);
  const [isModalErrorVisible, setIsModalErrorVisible] = useState(false);
  const import_statuses = {
    '/': 'SALES_IMPORT',
    '/goodlist': 'GOODS_IMPORT',
    '/stats': 'ORDERS_IMPORT',
    '/delivery': 'INCOMES_IMPORT'
  };

  const limits = ['first', 'second', 'third', 'fourth', 'fifth'];

  const hideElements = () => {
    return !['/goodlist', '/', '/delivery'].includes(router.pathname);
  };

  const createIncomes = async () => {
    let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
    try {
      setLoading(true);
      const res = await fetchWarehousesCreateIncomes(incomes);
      if (res.length) {
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

  const getCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetchGetCompaniesLimits();
      if (res) {
        setCompanies(res);
      } else {
        setError(res?.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const sendCompanies = async (data) => {
    try {
      setLoading(true);
      const res = await fetchSetCompaniesLimits(data);
      if (res) {
        setCompanies((prev) => {
          return { ...prev, ...res };
        });
      } else {
        setError(res?.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCompanies();
  }, []);

  useEffect(() => {
    getStatus({ type: import_statuses[router.pathname || '/'] });
  }, [router, currentWbKey]);

  const getStatus = async ({ type }) => {
    try {
      setLoading(true);
      const res = await fetchGetDataImportStatus({
        type,
        wb_keys: currentWbKey
      });
      if (res.length) {
        setStatus(res);
      } else {
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
        <div>
          Последнее обновление:{' '}
          {status.map((item, i) => (
            <div key={i}>
              {item.wb_key} {moment(item.run_dt).format(dateTimeFormat)}
            </div>
          ))}
        </div>
      </div>
      <div className="box">
        <RangePicker
          defaultValue={[
            date ? moment(date[0], dateFormatReverse) : null,
            date ? moment(date[1], dateFormatReverse) : null
          ]}
          size="small"
          style={{ width: '220px' }}
          format={dateFormatReverse}
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
            &nbsp;дней
          </div>
        )}
      </div>
      {hideElements() && (
        <div className="box">
          <div>
            Надбавка:{' '}
            {
              <InputNumber
                type="number"
                min={0}
                //value={fetchGetCompaniesSurcharge}
                // onBlur={(e) => {
                //   sendCompanies({ first: e.target.value });
                // }}
                // onPressEnter={(e) => {
                //   sendCompanies({ first: e.target.value });
                // }}
              />
            }
            %
          </div>
        </div>
      )}
      {companies && (
        <div className="box">
          <div>Остатки на складе</div>
          <div className="progressWrapper">
            {limits.map((item) => (
              <Popover
                content={
                  <InputNumber
                    type="number"
                    min={0}
                    defaultValue={companies[item]}
                    onBlur={(e) => {
                      sendCompanies({ [item]: e.target.value });
                    }}
                    onPressEnter={(e) => {
                      sendCompanies({ [item]: e.target.value });
                    }}
                  />
                }
                title="Изменение лимита"
              >
                <div
                  style={{ backgroundColor: companies[`${item}_color`] }}
                  className="progress"
                >
                  {companies[item]}
                </div>
              </Popover>
            ))}
          </div>
        </div>
      )}
      <div className="box">
        <Select
          mode="multiple"
          showArrow
          defaultValue={currentWbKey}
          placeholder="Поставщиĸ"
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
