import type {
  FC,
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';

export const Table: FC<TableHTMLAttributes<HTMLTableElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <table
    className={`min-w-full border-collapse ${className}`.trim()}
    {...props}
  >
    {children}
  </table>
);

export const TableHeader: FC<HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <thead className={className} {...props}>
    {children}
  </thead>
);

export const TableBody: FC<HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <tbody className={className} {...props}>
    {children}
  </tbody>
);

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

export const TableRow: FC<TableRowProps> = ({
  className = '',
  children,
  ...props
}) => (
  <tr className={className} {...props}>
    {children}
  </tr>
);

interface TableCellProps
  extends
    TdHTMLAttributes<HTMLTableCellElement>,
    ThHTMLAttributes<HTMLTableCellElement> {
  isHeader?: boolean;
  children: ReactNode;
}

export const TableCell: FC<TableCellProps> = ({
  isHeader = false,
  className = '',
  children,
  ...props
}) => {
  if (isHeader) {
    return (
      <th className={className} {...props}>
        {children}
      </th>
    );
  }

  return (
    <td className={className} {...props}>
      {children}
    </td>
  );
};

export default Table;
