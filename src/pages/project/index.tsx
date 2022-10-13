import { Button, notification, Space, Table, Input, Select } from 'antd';
import { DeleteOutlined, FormOutlined } from '@ant-design/icons'
import { Observer, useLocalObservable } from 'mobx-react';
import React, { Fragment, useCallback, useRef, useState } from 'react';
import { IType, IMSTArray } from 'mobx-state-tree'
import EditPage from '@/components/Editor'
import { Project, EditorComponent } from '../../types'
import apis from '@/api'
import { AlignAside } from '@/components/style'
import { useEffectOnce } from 'react-use';
import { cloneDeep } from 'lodash'
import store from '@/store';

const ProjectPage: React.FC = () => {
  const local = useLocalObservable<{ showEditPage: boolean, temp: Project, openEditor: Function, list: Project[] }>(() => ({
    showEditPage: false,
    list: [],
    temp: {},
    openEditor(data: Project) {
      local.showEditPage = true
      local.temp = data
    }
  }))
  const refresh = useCallback(async () => {
    const result = await apis.getProjects<Project>()
    if (result.code === 0) {
      local.list = result.data.items
      store.project.setList(result.data.items as IMSTArray<IType<Project, Project, Project>>);
    }
  }, [])
  const [fields] = useState([
    {
      field: 'title',
      title: '名称',
      type: 'string',
      component: EditorComponent.Input,
      defaultValue: '',
      autoFocus: false,
      value: [],
    },
    {
      field: 'name',
      title: '标识',
      type: 'string',
      component: EditorComponent.Input,
      defaultValue: '',
      autoFocus: false,
      value: [],
    },
    {
      field: 'desc',
      title: '描述',
      type: 'string',
      component: EditorComponent.Input,
      defaultValue: '',
      autoFocus: false,
      value: [],
    },
    {
      field: 'cover',
      title: '图片',
      type: 'string',
      component: EditorComponent.Image,
      defaultValue: '',
      value: [],
      autoFocus: false,
    },
    {
      field: 'status',
      title: '状态',
      type: 'number',
      component: EditorComponent.Input,
      defaultValue: 1,
      value: [],
      autoFocus: false,
    },
  ])
  const addProject = useCallback(async (params: { body: any }) => {
    const result = params.body.id ? await apis.updateProject(params) : await apis.createProject(params)
    if (result.code === 0) {
      notification.info({ message: params.body.id ? '修改成功' : '添加成功' })
      await refresh()
    }
  }, [])
  useEffectOnce(() => {
    refresh()
  })
  return (
    <Observer>{() => (<Fragment>
      <AlignAside style={{ margin: 10 }}>
        <Space>
          <Button type="primary" onClick={e => {
            refresh()
          }}>搜索</Button>
        </Space>
        <Space>
          <Button type="primary" onClick={e => {
            local.showEditPage = true
          }}>添加</Button>
        </Space>
      </AlignAside>
      <EditPage
        visible={local.showEditPage}
        close={() => { local.showEditPage = false; local.temp = {} }}
        data={local.temp}
        fields={fields}
        fetch={addProject}
      />
      <Table style={{ height: '100%' }} pagination={{ position: ['bottomRight'] }} rowKey="id" dataSource={local.list}>
        <Table.Column title="项目名称" dataIndex="title" />
        <Table.Column title="标识" dataIndex="name" />
        <Table.Column title="操作" key="id" render={(_, record: Project) => (
          <Space size="middle">
            <FormOutlined onClick={() => {
              local.openEditor(cloneDeep(record))
            }} />
            <DeleteOutlined onClick={async () => {
              // await apis.destroyComponent({ params: { id: record.id } })
              await refresh()
            }} />
          </Space>
        )} />
      </Table>
    </Fragment>)}
    </Observer>
  );
};

export default ProjectPage;