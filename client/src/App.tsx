import { createHashRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom';
import Game from './pages/Game';
import Menu from './pages/Menu';

const router = createHashRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/game/:id/user/:name" element={<Game />} />
      <Route path="/" element={<Menu />} />
      <Route path="*" element={<div>404</div>} />
    </Route>
  )
)

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;