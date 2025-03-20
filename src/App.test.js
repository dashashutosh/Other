import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // ✅ Import MemoryRouter
import App from './App';

test('renders learn react link', () => {
  render(
    <MemoryRouter> {/* ✅ Wrap App with MemoryRouter */}
      <App />
    </MemoryRouter>
  );
  
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
