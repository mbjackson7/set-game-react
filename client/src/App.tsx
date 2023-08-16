import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom';
import Game from './pages/Game';
import Menu from './pages/Menu';



const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/game/:id" element={<Game />} />
      <Route path="/" element={<Menu />} />
    </Route>
  ),
)

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;