import React, { useState } from 'react';
import { Button, Modal, Form, Input, Radio, DatePicker, Space, Table } from 'antd';

const ExpenseTracker = () => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(1);
  const [totalBudget, setTotalBudget] = useState(0);
  const [expense, setExpense] = useState(0);
  const [budgetItems, setBudgetItems] = useState([]);
  const [expenseItems, setExpenseItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form] = Form.useForm();

  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(date).toLocaleString('en-US', options);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Amount', dataIndex: 'value', key: 'value' },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (type === 1 ? 'Expense' : 'Budget'),
    },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (date) => formatDate(date) },
  ];

  const showModal = () => {
    setOpen(true);
    setSelectedDate(null); // Reset the selected date when modal is opened
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setOpen(false);

          const item = { ...values, type: value, date: selectedDate || new Date()};
          if (value === 2) {
            setBudgetItems([...budgetItems, item]);
            setTotalBudget((prev) => prev + parseFloat(values.value));
          } else {
            setExpenseItems([...expenseItems, item]);
            setExpense((prevExpense) => prevExpense + parseFloat(values.value));
          }

          form.resetFields();
          setSelectedDate(null);
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

  const onOk = (value) => {
    if (value) {
      setSelectedDate(value.toDate());
    } 
    else {
      setSelectedDate(null);
    }
  };

  const remainingAmount = totalBudget - expense;
  return (
    <>
      <h1>Expense Tracker</h1>

      <div>Total Budget: {totalBudget}</div>
      <div>Total Expense: {expense}</div>
      <div>Remaining Amount: {remainingAmount}</div>
      <Button onClick={showModal}>Add</Button>

      <h2>Budget Items</h2>
      <Table dataSource={budgetItems} columns={columns} />

      <h2>Expense Items</h2>
      <Table dataSource={expenseItems} columns={columns} />

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
            <DatePicker onOk={onOk} showTime format="D MMM YYYY HH:mm" />
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default ExpenseTracker;
