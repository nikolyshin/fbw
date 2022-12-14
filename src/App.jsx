import { Layout, Menu } from 'antd';
import { useNavigate, Route, Routes } from 'react-router-dom';
import 'antd/dist/antd.css';
import GoodList from './components/GoodList';
import Stats from './components/Stats';
import './App.css';
import AppHeader from './components/AppHeader/AppHeader';
import { fetchUsers } from './api';
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import DashBoard from './components/DashBoard';
import ModalLogout from './components/ModalLogout';
import moment from 'moment';
import Delivery from './components/Delivery';
import Auth from './components/auth/Auth';
import PageNotFound from './components/PageNotFound';
import 'moment/locale/ru';
moment.locale('ru');

const { Content, Footer, Sider, Header } = Layout;

const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentWbKey, setCurrentWbKey] = useState([]);
  const [surcharge, setSurcharge] = useState(null);
  const [planIncomes, setPlanIncomes] = useState(1);
  const [createdIncomes, setCreatedIncomes] = useState([]);
  const [changeIncome, setChangeIncome] = useState(false);
  const [date, setDate] = useState([moment(), moment()]);
  const [user, setUser] = useState(null);
  const [cookie] = useCookies(['token']);
  const [isModalVisible, setIsModalVisible] = useState(false);

  let navigate = useNavigate();

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchUsers({});
      if (res) {
        setUser(res);
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
    if (cookie.token) {
      getUsers();
    }
  }, [cookie]);

  const menuItems = [
    {
      label: 'Статистика',
      key: 'dashBoard',
      onClick: () => {
        navigate('/');
      }
    },
    {
      label: 'Товары',
      key: 'goodList',
      onClick: () => {
        navigate('/goodlist');
      }
    },
    {
      label: 'Планирование',
      key: 'stats',
      onClick: () => {
        navigate('/stats');
      }
    },
    {
      label: 'Список поставок',
      key: 'delivery',
      onClick: () => {
        navigate('/delivery');
      }
    },
    {
      label: 'Выйти',
      key: 'logout',
      onClick: () => {
        setIsModalVisible(true);
      }
    }
  ];
  if (!cookie.token) {
    return <Auth />;
  }

  return (
    <Layout
      hasSider
      style={{
        minHeight: '100vh'
      }}
    >
      <ModalLogout show={isModalVisible} setShow={setIsModalVisible} />
      <Sider
        collapsible
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0
        }}
      >
        <div className="company">
          <p>
            <b>{user?.username}</b>
          </p>
          {user?.companies.map((company, index) => (
            <p key={index}>{company.name}</p>
          ))}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={['1']}
          mode="inline"
          items={menuItems}
        />
      </Sider>

      <Layout className="site-layout">
        <Header>
          <AppHeader
            wbKeys={user?.wb_keys}
            currentWbKey={currentWbKey}
            setCurrentWbKey={setCurrentWbKey}
            surcharge={surcharge}
            setSurcharge={setSurcharge}
            planIncomes={planIncomes}
            setPlanIncomes={setPlanIncomes}
            setChangeIncome={setChangeIncome}
            date={date}
            setDate={setDate}
            setCreatedIncomes={setCreatedIncomes}
          />
        </Header>

        <Content
          className="site-layout-background"
          style={{
            padding: 24,
            marginTop: 140,
            minHeight: 280
          }}
        >
          <Routes>
            <Route
              path="/goodlist"
              element={<GoodList currentWbKey={currentWbKey} />}
            />
            <Route
              path="/stats"
              element={
                <Stats
                  date={date}
                  surcharge={surcharge}
                  changeIncome={changeIncome}
                  createdIncomes={createdIncomes}
                  setChangeIncome={setChangeIncome}
                  planIncomes={planIncomes}
                  currentWbKey={currentWbKey}
                />
              }
            />
            <Route path="/delivery" element={<Delivery />} />
            <Route
              path="/"
              element={<DashBoard currentWbKey={currentWbKey} date={date} />}
            />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Content>
        <Footer
          style={{
            textAlign: 'center'
          }}
        >
          FBW ©{moment().format('YYYY')}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
