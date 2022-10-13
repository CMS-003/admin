import { Layout, Dropdown, Menu } from 'antd';
import React, { Fragment, useEffect, useState } from 'react';
import logo from '../logo.svg';
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import MenuComponent from './menu'
import Router from '../router'
import store from '@/store';
import { useEffectOnce } from 'react-use';

const { Content, Sider } = Layout;

const App: React.FC<{ data: any }> = (props: { data: any }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [project_title, setProjectTitle] = useState('');
  useEffectOnce(() => {
    const project = store.project.list.find(it => it.id === store.app.project_id)
    if (project) {
      setProjectTitle(project.title);
    }
  })
  return (
    <Layout style={{ height: '100vh' }}>
      <Sider className="app-slider" collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div style={{ display: 'flex', alignItems: 'center', alignContent: 'center', justifyContent: 'center' }}>
          <Dropdown overlay={<Menu
            style={{}}
            onClick={e => {
              const id = e.key;
              const project = store.project.list.find(it => it.id === id);
              if (project) {
                store.app.setProjectId(e.key)
                setProjectTitle(project.title);
              }
            }}
            items={store.project.list.map(project => ({
              label: project.title,
              key: project.id,
              icon: <img src={project.cover || '/logo192.png'} alt="" style={{ width: 24, height: 24 }} />
            }))}
          />}>
            <div style={{ flexDirection: collapsed ? 'column' : 'row', color: 'white', display: 'flex', alignItems: 'center' }}>
              <img src={logo} alt="logo" style={{ width: 40, height: 40 }} />{project_title}
            </div>
          </Dropdown>
        </div>
        <MenuComponent tree={props.data} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 10, alignItems: 'center' }}>
          <Avatar icon={<UserOutlined />} />
          <span style={{ marginTop: 5, color: 'wheat' }}>{store.user.info?.account}</span>
        </div>
      </Sider>
      <Layout className="site-layout">
        <Content style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="site-layout-background" style={{ height: '100%', display: 'flex', overflow: 'auto', flexDirection: 'column' }}>
            <Router />
          </div>
        </Content>
        <div style={{ textAlign: 'center', padding: 10 }}>Ant Design ©2018 Created by Ant UED</div>
      </Layout>
    </Layout >
  );
};

export default App;