const Card = ({ children, className, ...props }) => {
    return (
      <div className={`bg-#f0f7f4 shadow-md rounded-lg p-4 ${className}`} {...props}>
        {children}
      </div>
    );
  };
  
  export default Card;
  