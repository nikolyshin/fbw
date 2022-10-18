import {
  fetchGetGoodsIncomes,
  fetchGoodsIncomes,
  fetchGoodsIncomesFilters,
  fetchSetStatus
} from '../api';
import React, { useEffect, useRef, useState } from 'react';
import {
  Spin,
  Table,
  Alert,
  Input,
  Select,
  DatePicker,
  Button,
  InputNumber
} from 'antd';
import moment from 'moment';
import FilterRangeDate from './FilterRangeDate';
import { dateFormat, dateFormatReverse, names } from './helpers';
import { read, utils, writeFile, writeFileXLSX } from 'xlsx';
const { Option } = Select;

const Delivery = ({ currentWbKey }) => {
  const [loading, setLoading] = useState(false);
  const idRef = useRef(null);
  const [error, setError] = useState('');
  const [goods, setGoods] = useState([]);
  const [detail, setDetail] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true
  });

  const getDeatil = async (id) => {
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
      const res = await fetchSetStatus(id || idRef.current, {
        income_id,
        status,
        plan_date,
        incomes: [{ id: productId, quantity }]
      });
      if (res.incomes) {
        setDetail(res.incomes);
      } else {
        setError(res.detail);
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

  const getGoodsList = async (pagination, filters) => {
    try {
      setLoading(true);
      const res = await fetchGoodsIncomes({
        wb_keys: currentWbKey,
        limit: pagination?.pageSize,

        //filters
        warehouse_name__in: filters?.warehouse_name,
        status__in: filters?.status,

        //filters range
        date_from: filters?.date
          ? moment(filters?.date[0]).format(dateFormat)
          : null,
        date_to: filters?.date
          ? moment(filters?.date[1]).format(dateFormat)
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
    getGoodsList();
    getGoodsListFilters();
  }, [currentWbKey]);

  useEffect(() => {
    setColumns([
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
          return <p>{date ? moment(date).format(dateFormatReverse) : null}</p>;
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
        title: names.wb_key_name,
        width: 150,
        dataIndex: 'wb_key_name'
      },
      {
        title: names.date_close,
        width: 200,
        dataIndex: 'date_close',
        render: (date) => {
          return <p>{date ? moment(date).format(dateFormatReverse) : null}</p>;
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
          <Input
            placeholder={names.income_id}
            defaultValue={record.income_id}
            onPressEnter={(e) => {
              if (e.target.value) {
                changeDetail({ id: record.id, income_id: e.target.value });
              }
            }}
          />
        )
      },
      {
        title: names.plan_date,
        dataIndex: 'plan_date',
        width: 120,
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
        width: 150,
        filterSearch: true,
        filters: Object.entries(filters?.status || []).map((item) => {
          return { text: item[1], value: item[0] };
        }),
        render: (_, record) => (
          <Select
            value={record.status}
            placeholder="Выберите статус"
            onChange={(value) => {
              changeDetail({ id: record.id, status: value });
            }}
            style={{
              width: 200
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
  }, [filters]);

  const columnsDetail = [
    {
      title: () => {
        return (
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => {
              const ws = utils.json_to_sheet(detail);
              const wb = utils.book_new();
              utils.book_append_sheet(wb, ws, 'Data');
              writeFileXLSX(wb, 'detail.xlsx');
            }}
          >
            Выгрузить в excel
          </Button>
        );
      },

      children: [
        {
          title: names.brand,
          width: 70,
          dataIndex: 'brand'
        },
        {
          title: names.article,
          dataIndex: 'article'
        },
        {
          title: names.item_name,
          dataIndex: 'item_name'
        },
        {
          title: names.subject,
          dataIndex: 'subject'
        },
        {
          title: names.quantity,
          dataIndex: 'quantity',
          width: 100,
          render: (_, record) => (
            <InputNumber
              placeholder="Введите количество"
              value={record.quantity}
              onPressEnter={(e) => {
                if (e.target.value) {
                  changeDetail({
                    productId: record.id,
                    quantity: e.target.value
                  });
                }
              }}
            />
          )
        }
      ]
    }
  ];
  return (
    <>
      <div style={{ display: 'flex', gap: 16 }}>
        <Spin spinning={loading}>
          <Table
            bordered
            size="small"
            scroll={{ x: true }}
            sticky={{ offsetHeader: 140 }}
            columns={columns}
            dataSource={goods}
            pagination={pagination}
            onChange={getGoodsList}
            onRow={(record) => {
              return {
                onDoubleClick: () => {
                  idRef.current = record.id;
                  getDeatil(record.id);
                }
              };
            }}
          />
        </Spin>
        <Spin spinning={loading}>
          <Table
            size="small"
            bordered
            scroll={{ x: true }}
            columns={columnsDetail}
            dataSource={detail}
            pagination={false}
            sticky={{ offsetHeader: 140 }}
          />
        </Spin>
      </div>
      {!!error && <Alert closable message={error} type="error" />}
    </>
  );
};

export default Delivery;
