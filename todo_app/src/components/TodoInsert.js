import { MdAdd } from "react-icons/md";
import "./TodoInsert.scss";
import { useState, useCallback } from "react";

const TodoInsert = ({ onInsert }) => {
  const [value, setvalue] = useState("");

  const onChange = useCallback((e) => {
    setvalue(e.target.value);
  }, []);

  const onSubmit = useCallback(
    (e) => {
      onInsert(value);
      setvalue("");
      e.preventDefault();
    },
    [onInsert, value]
  );

  return (
    <form className="TodoInsert" onSubmit={onSubmit}>
      <input
        placeholder="할 일을 입력하세요"
        value={value}
        onChange={onChange}
      ></input>
      <button type="submit">
        <MdAdd />
      </button>
    </form>
  );
};

export default TodoInsert;
