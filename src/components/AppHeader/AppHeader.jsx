import { Button, DatePicker, InputNumber, Popover, Select } from 'antd';
import './AppHeader.css';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import {
  fetchGetCompaniesLimits,
  fetchGetDataImportStatus,
  fetchSetCompaniesLimits,
  fetchWarehousesCreateIncomes,
  fetchGetCompaniesSurcharge,
  fetchPatchCompaniesSurcharge
} from '../../api';
import { useEffect, useState } from 'react';
import ModalSuccess from '../ModalSuccess';
import ModalError from '../ModalError';
import { dateFormatReverse, dateTimeFormat } from '../helpers';
import { ReactComponent as Arrow } from './arrow_right.svg';
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
  setDate,
  surcharge,
  setSurcharge
}) => {
  let router = useLocation();
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState([]);
  const [isModalSuccessVisible, setIsModalSuccessVisible] = useState(false);
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
      if (res.status === 201) {
        localStorage.removeItem('incomes');
        setIsModalSuccessVisible(true);
        setChangeIncome(true);
      } else {
        setError(true);
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

  const getSurcharge = async () => {
    try {
      setLoading(true);
      const res = await fetchGetCompaniesSurcharge();
      if (res.status === 200) {
        setSurcharge(res.data.value);
      } else {
        setError(...Object.values(res.data));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const sendSurcharge = async (data) => {
    try {
      setLoading(true);
      const res = await fetchPatchCompaniesSurcharge(data);
      if (res.status === 200) {
        setSurcharge(res.data.value);
      } else {
        setError(...Object.values(res.data));
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
    if (router.pathname === '/stats') {
      getSurcharge();
    }
  }, [router]);

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
          <b>?????????????????? ????????????????????:</b>{' '}
          {moment(status.run_dt).format(dateTimeFormat)}
        </div>
        {router.pathname === '/stats' && surcharge !== null && (
          <div>
            <b>????????????????:</b>{' '}
            {
              <InputNumber
                controls={false}
                type="number"
                min={0}
                defaultValue={surcharge}
                onBlur={(e) => {
                  sendSurcharge({ value: e.target.value });
                }}
                onPressEnter={(e) => {
                  sendSurcharge({ value: e.target.value });
                }}
              />
            }{' '}
            %
          </div>
        )}
        {hideElements() && (
          <div className="title">
            <b>?????????????????? ???????????????? ????:</b>{' '}
            <InputNumber
              controls={false}
              type="number"
              min={0}
              value={planIncomes}
              onBlur={(e) => {
                setPlanIncomes(e.target.value);
              }}
              onPressEnter={(e) => {
                setPlanIncomes(e.target.value);
              }}
            />{' '}
            ????????
          </div>
        )}
      </div>
      <div className="box">
        <b>???????????? ??????????????</b>
        <RangePicker
          defaultValue={[
            date ? moment(date[0], dateFormatReverse) : null,
            date ? moment(date[1], dateFormatReverse) : null
          ]}
          separator={<Arrow className="asdgsd" />}
          size="small"
          style={{ width: '220px' }}
          format={dateFormatReverse}
          onChange={setDate}
          placeholder={['???????? ????????????', '???????? ??????????']}
        />
      </div>
      {companies && (
        <div className="box">
          <b>?????????????? ???? ????????????</b>
          <div className="progressWrapper">
            {limits.map((item, i) => (
              <Popover
                key={i}
                content={
                  <InputNumber
                    controls={false}
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
                title="?????????????????? ????????????"
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
        <b>???????????? ??????????????????????</b>
        <Select
          mode="multiple"
          showArrow
          defaultValue={currentWbKey}
          placeholder="??????????????????"
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
            ?????????????? ????????????????
          </Button>
        )}
        <ModalSuccess
          show={isModalSuccessVisible}
          setShow={setIsModalSuccessVisible}
          title="???????????????? ?????????????? ??????????????"
        />
        <ModalError
          show={error}
          setShow={() => setError(null)}
          title="?????????????????? ????????????"
          subtitle={error}
        />
      </div>
    </div>
  );
};

export default AppHeader;
