import { Button, InputNumber, Modal, Table } from 'antd';
import { dateFormatReverse, names } from './helpers';
import { utils, writeFileXLSX } from 'xlsx';
import moment from 'moment';

const ModalDeliveryDetail = ({
  row,
  show,
  setShow,
  data,
  changeDetail,
  loading
}) => {
  const handleOk = () => {
    setShow(false);
  };

  const handleCancel = () => {
    setShow(false);
  };

  const columns = [
    {
      title: () => {
        return (
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => {
              const filteredDetail = data.map((item) => {
                return { barcode: item.barcode, quantity: item.quantity };
              });
              const wb = utils.book_new();
              const ws = utils.json_to_sheet(filteredDetail, {
                origin: 'A2',
                skipHeader: true
              });
              utils.sheet_add_aoa(ws, [['Баркод', 'Количество']]);
              utils.book_append_sheet(wb, ws);
              const name = `${row.wb_key_name}_${
                row.plan_date
                  ? moment(row.plan_date).format(dateFormatReverse) + '_'
                  : ''
              }${row.warehouse_name}.xlsx`;
              writeFileXLSX(wb, name);
            }}
          >
            Выгрузить в excel
          </Button>
        );
      },

      children: [
        {
          title: names.brand,
          width: 100,
          dataIndex: 'brand'
        },
        {
          title: names.article,
          width: 200,
          dataIndex: 'article'
        },
        {
          title: names.item_name,
          width: 200,
          dataIndex: 'item_name'
        },
        {
          title: names.subject,
          width: 150,
          dataIndex: 'subject'
        },
        {
          title: names.quantity,
          dataIndex: 'quantity',
          width: 100,
          render: (_, record) => (
            <InputNumber
              type="number"
              controls={false}
              disabled={
                row?.income_id || row?.status !== 'Заказано у поставщика'
              }
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
      <Modal
        width={1000}
        footer={null}
        visible={show}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Table
          loading={loading}
          size="small"
          bordered
          columns={columns}
          dataSource={data}
          pagination={false}
          // sticky={{ offsetHeader: 140 }}
        />
      </Modal>
    </>
  );
};

export default ModalDeliveryDetail;
