import { Divider, Layout, Menu } from "antd";
import { useLocation, useNavigate, Route, Routes } from "react-router-dom";
import "antd/dist/antd.css";
import GoodList from "./components/GoodList";
import Stats from "./components/Stats";
import "./App.css";
import AppHeader from "./components/AppHeader/AppHeader";
const { Header, Content, Footer, Sider } = Layout;

const App = () => {
  let navigate = useNavigate();

  const menuItems = [
    {
      label: "Good List",
      key: "goodList",
      onClick: () => {
        navigate("/goodList");
      },
    },
    {
      label: "Stats",
      key: "stats",
      onClick: () => {
        navigate("/stats");
      },
    },
  ];

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider>
        <div className="logo" />
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout className="site-layout">
        <AppHeader />

        <Content>
          <div
            className="site-layout-background"
            style={{
              padding: 24,
              minHeight: "100vh",
            }}
          >
            <Routes>
              <Route path="/goodlist" element={<GoodList />} />
              <Route path="/stats" element={<Stats />} />
            </Routes>
          </div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          FBW ©2022
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
