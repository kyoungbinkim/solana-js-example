import logo from './logo.svg';
import './App.css';

import Home from './wallet/Phantom.js';
import BalanceDisplay from './wallet/Info.jsx';

function App() {
  return (
    <div className="App">
      <Home />
      <BalanceDisplay />
    </div>
  );
}

export default App;

// 코드 리팩토링,

// 파일명, 클래스명 카맬로 변경 

// 실제 구현된 함 수 따로있

// request