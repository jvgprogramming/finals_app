import { useEffect, type FC } from 'react';

interface ToastMessageProps {
  message: string;
  isFailed?: boolean;
  isVisible: boolean;
  onClose: () => void;
}

const ToastMessage: FC<ToastMessageProps> = ({ 
    message, 
    isFailed,
    isVisible, 
    onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    },[isVisible, onClose])
  return (
    <>
      <div
        className={`fixed top-40 right-0 md:right-4 z-999999 flex items-center w-auto max-w-sm p-4 mb-4 text-black ${isFailed?' bg-red-100':' bg-green-100'} rounded-lg shadow-lg transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        role="alert"
      >
        <div
          className={`inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 ${isFailed?' text-red-500':' text-green-500'} ${isFailed?' bg-red-200':' bg-green-200'} rounded-lg transition-transform duration-300 ${
            isVisible ? 'translate-y-0' : '-translate-y-10'
          }`}
        >
          {isFailed ? (
            <>
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/></svg>
              <span className="sr-only">Error icon</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414l1.293 1.293 3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              <span className="sr-only">Check icon</span>
            </>
          )}
        
        </div>

        <div className="ms-3 text-sm font-medium">{message}</div>
      </div>
    </>
  );
};

export default ToastMessage;