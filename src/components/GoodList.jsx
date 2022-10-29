import {
  fetchEditProduct,
  fetchGoodsList,
  fetchGoodsListFilters
} from '../api';
import React, { useEffect, useState, useRef } from 'react';
import { Spin, Table, Divider, Input } from 'antd';
import ModalChangeProduct from './ModalChangeProduct';
import ResizableTitle from './ResizableTitle';
import { resize } from './resize';
import FilterRange from './FilterRange';
import { names } from './helpers';
import SelectColumns from './SelectColumns';
import ModalError from './ModalError';

const { Search } = Input;

const GoodList = ({ currentWbKey }) => {
  const [loading, setLoading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [errorEdit, setErrorEdit] = useState(null);
  const [search, setSearch] = useState(null);
  const [error, setError] = useState('');
  const [goods, setGoods] = useState([]);
  const [filters, setFilters] = useState({});
  const idRef = useRef(null);
  const [modalData, setModalData] = useState({
    data: [],
    visible: false
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true
  });

  const [columns, setColumns] = useState([]);
  const [columnsSelect, setColumnsSelect] = useState([]);

  const onFinish = async (data) => {
    try {
      setLoadingEdit(true);
      const res = await fetchEditProduct(idRef.current, {
        price: data.price,
        discount_price: data.discount_price,
        characteristics: data.characteristics
      });
      if (!res.detail) {
        setModalData((prev) => {
          return { ...prev, visible: false };
        });
      } else {
        setErrorEdit(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingEdit(false);
    }
  };

  const getGoodsListFilters = async () => {
    try {
      setLoading(true);
      const res = await fetchGoodsListFilters({
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

  const getGoodsList = async (pagination, filters, sorter) => {
    let ordering;
    if (!!sorter) {
      ordering = sorter.order
        ? `${sorter.order === 'ascend' ? '' : '-'}${sorter.field}`
        : null;
    }
    try {
      setLoading(true);
      const res = await fetchGoodsList({
        wb_keys: currentWbKey,
        search,
        limit: pagination?.pageSize,
        offset: (pagination?.current - 1) * pagination?.pageSize || null,
        //sort
        ordering,

        //filters
        category__in: filters?.category,
        brand__in: filters?.brand,
        subject__in: filters?.subject,
        article_wb__in: filters?.article_wb,
        article_1c__in: filters?.article_1c,
        barcode__in: filters?.barcode,
        wb_key_name__in: filters?.wb_key_name,

        //filters range
        discount__range: filters?.discount,
        discount_price__range: filters?.discount_price,
        price__range: filters?.price,
        multiplicity__range: filters?.multiplicity,
        stock__range: filters?.stock
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
    getGoodsListFilters();
  }, [currentWbKey]);

  useEffect(() => {
    getGoodsList();
  }, [currentWbKey, search]);

  useEffect(() => {
    setColumnsSelect(columns);
  }, [columns]);

  useEffect(() => {
    setColumns([
      {
        title: names.wb_key_name,
        dataIndex: 'wb_key_name',
        filterSearch: true,
        filters: filters?.wb_key_name?.map((item) => {
          return { text: item, value: item };
        }),
        sorter: true,
        width: 120
      },
      {
        title: names.category,
        dataIndex: 'category',
        filterSearch: true,
        filters: filters?.categories?.map((item) => {
          return { text: item, value: item };
        }),
        sorter: true,
        width: 120
      },
      {
        title: names.brand,
        dataIndex: 'brand',
        filterSearch: true,
        filters: filters?.brands?.map((item) => {
          return { text: item, value: item };
        }),
        sorter: true,
        width: 100
      },
      {
        title: names.subject,
        dataIndex: 'subject',
        filterSearch: true,
        filters: filters?.subjects?.map((item) => {
          return { text: item, value: item };
        }),
        sorter: true,
        width: 100
      },
      {
        title: names.article_1c,
        dataIndex: 'article_1c',
        filterSearch: true,
        filters: filters?.articles_1c?.map((item) => {
          return { text: item, value: item };
        }),
        sorter: true,
        width: 100
      },
      {
        title: names.article_wb,
        dataIndex: 'article_wb',
        filterSearch: true,
        filters: filters?.articles_wb?.map((item) => {
          return { text: item, value: item };
        }),
        sorter: true,
        width: 100
      },
      {
        title: names.barcode,
        dataIndex: 'barcode',
        filterSearch: true,
        filters: filters?.barcodes?.map((item) => {
          return { text: item, value: item };
        }),
        sorter: true,
        width: 100
      },
      {
        title: names.multiplicity,
        dataIndex: 'multiplicity',
        filterDropdown: (props) => (
          <FilterRange
            {...props}
            min={filters?.multiplicity?.min_value}
            max={filters?.multiplicity?.max_value}
          />
        ),
        sorter: true,
        width: 100
      },

      {
        title: names.stock,
        dataIndex: 'stock',
        filterSearch: true,
        filterDropdown: (props) => (
          <FilterRange
            {...props}
            min={filters?.stock?.min_value}
            max={filters?.stock?.max_value}
          />
        ),
        sorter: true,
        width: 100
      },
      {
        title: names.discount_price,
        dataIndex: 'discount_price',
        sorter: true,
        width: 140,
        filterDropdown: (props) => (
          <FilterRange
            {...props}
            min={filters?.discount_price?.min_value}
            max={filters?.discount_price?.max_value}
          />
        )
      },
      {
        title: names.price,
        dataIndex: 'price',
        sorter: true,
        width: 100,
        filterDropdown: (props) => (
          <FilterRange
            {...props}
            min={filters?.price?.min_value}
            max={filters?.price?.max_value}
          />
        )
      },
      {
        title: names.discount,
        dataIndex: 'discount',
        sorter: true,
        width: 100,
        filterDropdown: (props) => (
          <FilterRange
            {...props}
            min={filters?.discount?.min_value}
            max={filters?.discount?.max_value}
          />
        )
      }
    ]);
  }, [filters]);

  return (
    <>
      <Search
        style={{ width: '50%' }}
        placeholder="Поиск"
        loading={loading}
        enterButton
        allowClear
        onSearch={setSearch}
      />

      <Divider />
      <SelectColumns
        columnsAll={columns}
        columnsSelect={columnsSelect}
        setColumnsSelect={setColumnsSelect}
      />
      <Spin spinning={loading}>
        <Table
          size="small"
          bordered
          components={{
            header: {
              cell: ResizableTitle
            }
          }}
          columns={resize({
            columns: columnsSelect,
            setColumns: setColumnsSelect
          })}
          scroll={{ x: 0 }}
          dataSource={goods}
          sticky={{ offsetHeader: 140 }}
          pagination={pagination}
          onChange={getGoodsList}
          onRow={(record) => {
            return {
              onDoubleClick: () => {
                idRef.current = record.id;
                setModalData({
                  visible: true,
                  characteristics: record.characteristics.map((item) => {
                    return {
                      name: Object.keys(item)[0],
                      value: Object.values(item)[0]
                    };
                  }),
                  data: Object.entries(record).map((item) => {
                    return {
                      name: item[0],
                      value: item[1],
                      label: names[item[0]]
                    };
                  })
                });
              }
            };
          }}
        />
      </Spin>
      <ModalError
        show={!!error}
        setShow={setError}
        title="Произошла ошибка"
        subtitle={error}
      />
      {modalData.visible && (
        <ModalChangeProduct
          id={idRef.current}
          visible={modalData.visible}
          loading={loadingEdit}
          error={errorEdit}
          characteristics={modalData.characteristics}
          fields={modalData.data}
          onFinish={onFinish}
          onCancel={() => {
            setModalData((prev) => {
              return { ...prev, visible: false };
            });
          }}
        />
      )}
    </>
  );
};

export default GoodList;
