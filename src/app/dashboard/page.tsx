"use client"
import React from 'react'
import OverView from './over-view'
import ListToken from './table-dashboard';

const Dashboard = () => {
  return (
    <>
      <div className='container-body px-[40px] flex flex-col gap-6 pt-[30px] relative mx-auto z-10'>
        <OverView />
        <ListToken />
      </div>
    </>
  )
}

export default Dashboard;