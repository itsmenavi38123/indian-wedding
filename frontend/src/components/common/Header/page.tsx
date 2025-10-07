'use client';

import React from 'react';
import DesktopHeader from './components/DesktopHeader';
import MobileHeader from './components/MobileHeader';

const IndexHeader = () => {
  return (
    <>
      <DesktopHeader />
      <MobileHeader />
    </>
  );
};

export default IndexHeader;
