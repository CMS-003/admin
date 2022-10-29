import React, { useCallback } from 'react';
import Layout from './layout'
import { Route, Routes } from 'react-router-dom'
import { Observer, useLocalObservable } from 'mobx-react';
import { useNavigate, useLocation } from "react-router-dom";
import { IType, IMSTArray, onSnapshot, getSnapshot } from 'mobx-state-tree'
import { useEffectOnce } from 'react-use';
import { Space, Spin } from 'antd'
import apis from './api';
import SignInPage from './pages/SignInPage'
import store from './store'
import { Project, UserInfo } from '@/types'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const local = useLocalObservable(() => ({
    booting: true,
    error: false,
    setBooting(b: boolean) {
      this.booting = b;
    }
  }))

  const init = useCallback(async () => {
    const projectResult = await apis.getProjects<Project>()
    if (projectResult.code === 0) {
      store.project.setList(projectResult.data.items as IMSTArray<IType<Project, Project, Project>>)
    }
    const menuResult: any = await apis.getMenu()
    if (menuResult.code === 0) {
      store.menu.setTree(menuResult.data)
    }
    const componentTypes: any = await apis.getComponentTypes()
    if (componentTypes.code === 0) {
      store.component.setTypes(componentTypes.data.items)
    }
  }, [])
  useEffectOnce(() => {
    (async () => {
      try {
        if (location.pathname !== '/sign-in') {
          const result = await apis.getProfile<UserInfo>();
          if (result.code !== 0) {
            navigate('/sign-in')
          } else {
            store.user.setInfo(result.data)
          }
          await init();
          if (location.pathname === '/') {
            navigate('/dashboard')
          }
        }
        local.setBooting(false)
      } catch (e) {
        console.log(e)
      }
    })();
    return () => {

    }
  })
  return (
    <Observer>{() => (
      <div className="App">
        {local.booting ? <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Space>
            <Spin spinning />加载中...
          </Space>
        </div> : <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/*" element={<Layout data={store.menu.tree} />} />
        </Routes>}
      </div>
    )}</Observer>
  );
}

export default App;
