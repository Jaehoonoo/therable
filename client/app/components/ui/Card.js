const Card = ({ children, className, ...props }) => {
    return (
      <div className={`bg-white shadow-md rounded-lg p-4 ${className}`} {...props}>
        {children}
      </div>
    );
  };
  
  export default Card;
  