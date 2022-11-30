import {
  fetchGetGoodsIncomes,
  fetchGoodsIncomes,
  fetchGoodsIncomesFilters,
  fetchSetStatus
} from '../api';
import React, { useEffect, useRef, useState } from 'react';
import { Table, Select, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import FilterRangeDate from './FilterRangeDate';
import { dateFormat, dateFormatReverse, names } from './helpers';
import ModalError from './ModalError';
import ModalDeliveryDetail from './ModalDeliveryDetail';
import SelectColumns from './SelectColumns';
import ResizableTitle from './ResizableTitle';
import { resize } from './resize';
const { Option } = Select;

const nameOfStoreColumns = 'deliveryColumns';

const Delivery = ({ currentWbKey }) => {
  const [loading, setLoading] = useState(false);
  const currentRow = useRef(null);
  const [error, setError] = useState('');
  const [openModalDetail, setOpenModalDetail] = useState(false);
  const [goods, setGoods] = useState([]);
  const [detail, setDetail] = useState([]);
  const [columns, setColumns] = useState([]);
  const [columnsSelect, setColumnsSelect] = useState(
    JSON.parse(localStorage.getItem(nameOfStoreColumns)) || []
  );
  const [filters, setFilters] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [currentOrdering, setCurrentOrdering] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true
  });

  const getDetail = async (id) => {
    try {
      setLoading(true);
      const res = await fetchGetGoodsIncomes(id);
      if (res.incomes) {
        setDetail(res.incomes);
      } else {
        setError(res.detail);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const changeDetail = async ({
    id,
    income_id,
    status,
    plan_date,
    quantity,
    productId
  }) => {
    try {
      setLoading(true);
      const res = await fetchSetStatus(id || currentRow.current.id, {
        income_id,
        status,
        plan_date,
        ...(quantity && { incomes: [{ id: productId, quantity }] })
      });
      if (res.status === 200) {
        setGoods((prev) => {
          return prev.map((item) =>
            item.id === res.data?.id ? res.data : item
          );
        });
      } else {
        setError(...Object.values(res.data));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getGoodsListFilters = async () => {
    try {
      setLoading(true);
      const res = await fetchGoodsIncomesFilters({
        wb_keys: currentWbKey
      });
      if (!res.detail) {
        setFilters(res);
      } else {
        setError(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const setCurrentData = async (pagination, filters, sorter) => {
    let ordering;
    if (!!sorter) {
      ordering = sorter.order
        ? `${sorter.order === 'ascend' ? '' : '-'}${sorter.field}`
        : null;
    }
    setCurrentOrdering(ordering);
    setCurrentFilters(filters);
    setPagination(pagination);
  };

  const getGoodsList = async () => {
    try {
      setLoading(true);
      const res = await fetchGoodsIncomes({
        wb_keys: currentWbKey,
        limit: pagination?.pageSize,
        //sort
        ordering: currentOrdering,

        //filters
        warehouse_name__in: currentFilters?.warehouse_name,
        status__in: currentFilters?.status,

        //filters range
        date_from: currentFilters?.date
          ? moment(currentFilters?.date[0]).format(dateFormat)
          : null,
        date_to: currentFilters?.date
          ? moment(currentFilters?.date[1]).format(dateFormat)
          : null,
        offset: (pagination?.current - 1) * pagination?.pageSize || null
      });
      if (res.results) {
        setGoods(res.results);
        setPagination((prev) => {
          return {
            ...prev,
            pageSize: pagination?.pageSize,
            current: pagination?.current,
            total: Math.ceil(res.count)
          };
        });
      } else {
        setError(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(goods);
  }, [goods]);

  useEffect(() => {
    getGoodsListFilters();
  }, [currentWbKey]);

  useEffect(() => {
    getGoodsList();
  }, [
    currentWbKey,
    currentFilters,
    currentOrdering,
    pagination.current,
    pagination.pageSize
  ]);

  useEffect(() => {
    if (!columnsSelect.length) {
      setColumnsSelect(columns);
    }
  }, [columns]);

  useEffect(() => {
    if (filters) {
      setColumns([
        {
          title: names.wb_key_name,
          width: 150,
          dataIndex: 'wb_key_name'
        },
        {
          title: names.date,
          width: 100,
          dataIndex: 'date',
          filterDropdown: (props) => (
            <FilterRangeDate
              {...props}
              min={filters?.date?.min_value}
              max={filters?.date?.max_value}
            />
          ),
          render: (date) => {
            return (
              <p>{date ? moment(date).format(dateFormatReverse) : null}</p>
            );
          }
        },
        {
          title: names.warehouse_name,
          dataIndex: 'warehouse_name',
          width: 120,
          filterSearch: true,
          filters: filters?.warehouse_name?.map((item) => {
            return { text: item, value: item };
          })
        },
        {
          title: names.quantity,
          width: 70,
          dataIndex: 'quantity'
        },
        {
          title: names.date_close,
          width: 100,
          dataIndex: 'date_close',
          render: (date) => {
            return (
              <p>{date ? moment(date).format(dateFormatReverse) : null}</p>
            );
          },
          filterDropdown: (props) => (
            <FilterRangeDate
              {...props}
              min={filters?.date?.min_value}
              max={filters?.date?.max_value}
            />
          )
        },
        {
          title: names.income_id,
          width: 150,
          dataIndex: 'income_id',
          render: (_, record) => (
            <InputNumber
              type="number"
              controls={false}
              placeholder={names.income_id}
              defaultValue={record.income_id}
              onPressEnter={(e) => {
                changeDetail({ id: record.id, income_id: e.target?.value });
              }}
            />
          )
        },
        {
          title: names.plan_date,
          dataIndex: 'plan_date',
          width: 150,
          render: (_, record) => (
            <DatePicker
              defaultValue={
                record.plan_date ? moment(record.plan_date, dateFormat) : null
              }
              format={dateFormatReverse}
              onChange={(value) => {
                changeDetail({
                  id: record.id,
                  plan_date: value ? moment(value).format(dateFormat) : null
                });
              }}
              placeholder="Выберите время"
            />
          )
        },
        {
          title: names.status,
          dataIndex: 'status',
          width: 220,
          filterSearch: true,
          filters: Object.entries(filters?.status || []).map((item) => {
            return { text: item[1], value: item[0] };
          }),
          render: (_, record) => (
            <Select
              defaultValue={record.status}
              placeholder="Выберите статус"
              onChange={(value) => {
                changeDetail({ id: record.id, status: value });
              }}
              style={{
                width: '100%'
              }}
            >
              {Object.entries(filters?.status || []).map((item, i) => (
                <Option key={i} value={item[0]}>
                  {item[1]}
                </Option>
              ))}
            </Select>
          )
        }
      ]);
    }
  }, [filters]);

  return (
    <>
      <SelectColumns
        loading={loading}
        type={nameOfStoreColumns}
        columnsAll={columns}
        columnsSelect={columnsSelect}
        setColumnsSelect={setColumnsSelect}
      />

      <Table
        loading={loading}
        bordered
        components={{
          header: {
            cell: ResizableTitle
          }
        }}
        size="small"
        sticky={{ offsetHeader: 140 }}
        columns={resize({
          columns: columnsSelect,
          setColumns: setColumnsSelect
        })}
        scroll={{ x: 0 }}
        dataSource={goods}
        pagination={pagination}
        onChange={setCurrentData}
        onRow={(record) => {
          return {
            onDoubleClick: () => {
              currentRow.current = record;
              getDetail(record.id);
              setOpenModalDetail(true);
            }
          };
        }}
      />

      <ModalDeliveryDetail
        row={currentRow.current}
        data={detail}
        loading={loading}
        show={openModalDetail}
        changeDetail={changeDetail}
        setShow={setOpenModalDetail}
      />
      <ModalError
        show={!!error}
        setShow={setError}
        title="Произошла ошибка"
        subtitle={error}
      />
    </>
  );
};

export default Delivery;
