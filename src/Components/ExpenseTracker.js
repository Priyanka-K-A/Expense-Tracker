import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Radio, Select, Card, DatePicker, Space,  notification, Image } from 'antd';
import { GiHouse, GiForkKnifeSpoon, GiCash } from "react-icons/gi";
import { FaMotorcycle, FaHospitalUser, FaCartShopping } from "react-icons/fa6";
import { BsFillStarFill } from "react-icons/bs";
import { FaArrowCircleDown, FaArrowCircleUp } from "react-icons/fa";

import './expenseTracker.scss';

const { Option } = Select;

const ExpenseTracker = () => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(1);
  const [totalBudget, setTotalBudget] = useState(0);
  const [expense, setExpense] = useState(0);
  const [items, setItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form] = Form.useForm();
  const [greeting, setGreeting] = useState('');
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [warningClosed, setWarningClosed] = useState(false);
  
  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(date).toLocaleString('en-US', options).replace(',','');
  };  

  const getRowName = (rowname) => {
    return rowname.type === 1 ? 'expenseRow' : 'budgetRow';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'salary':
        return <GiCash />
      case 'housing':
        return <GiHouse />;
      case 'transportation':
        return <FaMotorcycle />;
      case 'food':
        return <GiForkKnifeSpoon />;
      case 'healthcare':
        return <FaHospitalUser />;
      case 'personal':
        return <FaCartShopping />;
      default:
        return <BsFillStarFill />;
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 'salary':
        return 'Salary';
      case 'housing':
        return 'Housing';
      case 'transportation':
        return 'Transportation';
      case 'food':
        return 'Food';
      case 'healthcare':
        return 'HealthCare';
      case 'personal':
        return 'personal';
      default:
        return 'Others';
    }
  };
  
  const showModal = () => {
    setOpen(true);
    setSelectedDate(null);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setOpen(false);

          const item = {
            ...values,
            type: value,
            date: selectedDate || new Date(),
            category: {
              name: getCategoryName(values.category),
              icon: getCategoryIcon(values.category),
            },
          };
          setItems([...items, item]);

          if (value === 2) {
            setTotalBudget((prev) => prev + parseFloat(values.value));
            // message.success("Budget added successfully!");
            notification.success({
              message:"Budget added successfully!",
              duration:2,
            })
          } else {
            setExpense((prevExpense) => prevExpense + parseFloat(values.value));
            notification.success({
              message: 'Expense added successfully!',
              duration: 2,
            });
          }

          form.resetFields();
          setSelectedDate(null);
        }, 1000);
      })
      .catch((errorInfo) => {
        console.log('Validation Failed:', errorInfo);
        notification.error({
          message: 'Validation failed. Please check the input values.',
          duration: 2,
        });
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
    } else {
      setSelectedDate(null);
    }
  };

  useEffect(() => {
    const getCurrentGreeting = () => {
      const currentHour = new Date().getHours();

      if (currentHour >= 0 && currentHour < 12) {
        setGreeting('Good Morning');
      } else if (currentHour >= 12 && currentHour < 18) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    };
    getCurrentGreeting();
    
    setRemainingAmount(totalBudget-expense);
    console.log("T",totalBudget);
    if((remainingAmount < 0 && !warningClosed ) || (totalBudget===0 && expense !==0 )){
      setWarningClosed(true);
      notification.warning({
        message: 'Warning: Your Budget is less than your Expenses!',
        duration: 3,
      });
    }
  }, [totalBudget,expense,warningClosed,remainingAmount]);

  return (
    <div className="expense-tracker">

      <div className='header'>
        <Image width={120} src="logo.png" className='title'  />
        <h1>Heyy!! {greeting}</h1> 
      </div>

      <div className='totalsBox'>
        <div className="totals">
          <div className='remainingAmount'>Your Available Balance 
            <div> ₹ {remainingAmount} </div>
          </div>
          <div className='budgetExpenses'>
            <div>
              <div className='displayBox'>
                <FaArrowCircleUp />
                <div className='incomeName'> Income </div>
              </div>
              <div> ₹ {totalBudget} </div>
            </div>
            <div>
              <div className='displayBox'>
                <FaArrowCircleDown />
                <div className='expenseName'> Expenses </div>
              </div>
              <div> ₹ {expense} </div>
            </div>  
          </div>
        </div>       
        <Button className="add-button" onClick={showModal}>Add</Button>
      </div>
      <div className='displayingExpenses'>
        <div className="card-container">
          {items.map((item, index) => (
            <Card key={index} className={`expense-budget-card ${getRowName(item)} `}>
              <div className='singleCard'>
                <div className='firstFlex'>
                  <div className={`icon ${item.category.name.toLowerCase()}`}>{item.category.icon}</div>
                  <div className='categoryName'>
                    <div>{item.category.name}</div>
                    <p>{item.name}</p>
                  </div>
                </div>
                <div className="categoryInfo">
                  <p className='amount'>{item.type === 2 ? '+' : '-'} ₹{item.value}</p>
                  <p>{formatDate(item.date)}</p>
                </div>
                
              </div>
            </Card>
          ))}
        </div>
      </div>

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
        <Form form={form} className="modal-form">
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter a name' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Amount" name="value" rules={[{ required: true, message: 'Please enter a value' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Please select a category' }]}>
            <Select placeholder="Select a category">
              <Option value="salary">Salary</Option>
              <Option value="housing">Housing</Option>
              <Option value="transportation">Transportation</Option>
              <Option value="food">Food</Option>
              <Option value="healthcare">Healthcare</Option>
              <Option value="personal">Personal and Leisure</Option>
              <Option value="others">Others</Option>
            </Select>
          </Form.Item>
          <Radio.Group onChange={onChange} value={value}>
            <Radio value={1}>Expense</Radio>
            <Radio value={2}>Budget</Radio>
          </Radio.Group>
          <Space>
            <DatePicker onOk={onOk} format="DD MMMM YYYY" />
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default ExpenseTracker;
