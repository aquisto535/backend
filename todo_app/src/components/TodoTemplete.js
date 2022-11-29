import "./TodoTemplete.scss";

const TodoTemplete = ({ children }) => {
  return (
    <div className="todotemplete">
      <div className="app-title">일정 관리</div>
      <div className="content">{children}</div>
    </div>
  );
};

export default TodoTemplete;
