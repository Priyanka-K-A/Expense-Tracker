import React, { useState } from 'react';
import { Button, Modal, Form, Input, Radio, DatePicker, Space, Table } from 'antd';

const ExpenseTracker = () => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(1);
  const [totalBudget, setTotalBudget] = useState(0);
  const [items, setItems] = useState([]);
  const [form] = Form.useForm(); 

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Amount', dataIndex: 'value', key: 'value' },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (type === 1 ? 'Expense' : 'Budget'),
    },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (date) => date.toLocaleString() },
  ];

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setOpen(false);
          setItems([...items, { ...values, type: value, date: new Date() }]);
          form.resetFields();
        }, 3000);
      })
      .catch((errorInfo) => {
        console.log('Validation Failed:', errorInfo);
      });
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const onChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <>
      <h1>Expense Tracker</h1>

      <div>Total Budget: {totalBudget}</div>
      <Button onClick={showModal}>Add</Button>

      <Table dataSource={items} columns={columns} />

      <Modal
        title="Add Item"
        visible={open}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button loading={loading} onClick={handleOk}>
            Add
          </Button>,
          <Button onClick={handleCancel}>Cancel</Button>,
        ]}
      >
        <Form form={form}>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter a name' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Amount" name="value" rules={[{ required: true, message: 'Please enter a value' }]}>
            <Input />
          </Form.Item>
          <Radio.Group onChange={onChange} value={value}>
            <Radio value={1}>Expense</Radio>
            <Radio value={2}>Budget</Radio>
          </Radio.Group>
          <Space>
            <DatePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default ExpenseTracker;
