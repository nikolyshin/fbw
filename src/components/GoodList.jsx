import {
  fetchEditProduct,
  fetchGoodsList,
  fetchGoodsListFilters
} from '../api';
import React, { useEffect, useState, useRef } from 'react';
import { Spin, Table, Alert, Divider, Input, Select } from 'antd';
import ModalChangeProduct from './ModalChangeProduct';
import ResizableTitle from './ResizableTitle';
import { resize } from './resize';
import FilterRange from './FilterRange';

const { Option } = Select;

const { Search } = Input;
const names = {
  category: 'Категории',
  subject: 'Группа товара',
  multiplicity: 'Кратность',
  brand: 'Брэнд',
  article_wb: 'Арт WB',
  article_1c: 'Арт 1С',
  barcode: 'БарКод',
  stock: 'Остаток',
  discount: 'discount',
  price: 'Цена',
  discount_price: 'discount_price'
};

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
    pageSize: 10
  });

  const [columns, setColumns] = useState([]);
  const [columnsSelect, setColumnsSelect] = useState([]);

  const onFinish = async (data) => {
    try {
      setLoadingEdit(true);
      const res = await fetchEditProduct(idRef.current, data);
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
    console.log(filters);
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
        ordering,
        search,
        limit: pagination?.pageSize,
        offset: (pagination?.current - 1) * pagination?.pageSize || null,
        category: filters?.category,
        price: filters?.price,
        multiplicity: filters?.multiplicity,
        discount: filters?.discount
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
        title: names.multiplicity,
        dataIndex: 'multiplicity',
        filteredValue: [
          filters?.multiplicity?.min_value || 0,
          filters?.multiplicity?.max_value || 0
        ],
        filterDropdown: (props) => <FilterRange {...props} />,
        sorter: true,
        width: 100
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
        title: names.stock,
        dataIndex: 'stock',
        filterSearch: true,
        // filters: filters?.stock?.map((item) => {
        //   return { text: item, value: item };
        // }),
        sorter: true,
        width: 100
      },
      {
        title: names.discount,
        dataIndex: 'discount',
        sorter: true,
        width: 100,
        filterSearch: true,
        filters: filters?.discounts?.map((item) => {
          return { text: item, value: item };
        })
      },
      {
        title: names.discount_price,
        dataIndex: 'discount_price',
        sorter: true,
        width: 100,
        filterSearch: true,
        filters: filters?.discounts?.map((item) => {
          return { text: item, value: item };
        })
      },
      {
        title: names.price,
        dataIndex: 'price',
        sorter: true,
        width: 100,
        filterSearch: true,
        filters: filters?.prices?.map((item) => {
          return { text: item, value: item };
        })
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
      <Select
        mode="multiple"
        allowClear
        showArrow
        value={columnsSelect.map((item) => item.title)}
        placeholder="Выбрать склад"
        style={{
          width: 600,
          marginBottom: '24px'
        }}
        onChange={(value) => {
          setColumnsSelect([
            ...columns.filter((item) => value.includes(item.title))
          ]);
        }}
      >
        {columns.map((item) => (
          <Option key={item.title} value={item.title}>
            {item.title}
          </Option>
        ))}
      </Select>
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
      {!!error && <Alert closable message={error} type="error" />}
      {modalData.visible && (
        <ModalChangeProduct
          id={idRef.current}
          visible={modalData.visible}
          loading={loadingEdit}
          error={errorEdit}
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
