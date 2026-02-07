import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SearchPage from './mobile/SearchPage';
import ListPage from './mobile/ListPage';
import DetailPage from './mobile/DetailPage';
import LoginPage from './admin/LoginPage';
import RegisterPage from './admin/RegisterPage';
import AdminLayout from './admin/AdminLayout';
import HotelList from './admin/HotelList';
import HotelForm from './admin/HotelForm';
import ReviewList from './admin/ReviewList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Mobile H5 */}
        <Route path="/m" element={<SearchPage />} />
        <Route path="/m/list" element={<ListPage />} />
        <Route path="/m/hotel/:id" element={<DetailPage />} />

        {/* Admin */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="hotels" element={<HotelList />} />
          <Route path="hotels/create" element={<HotelForm />} />
          <Route path="hotels/edit/:id" element={<HotelForm />} />
          <Route path="review" element={<ReviewList />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/m" replace />} />
        <Route path="*" element={<Navigate to="/m" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
