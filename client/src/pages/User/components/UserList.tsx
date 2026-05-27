import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../components/Table';
import UserService from '../../../services/UserService';
import Spinner from '../../../components/Spinner/Spinner';
import type { UserColumns } from '../../../interfaces/UserInterface';
import FloatingLabelInput from '../../../components/input/FloatingLabelInput';

interface UserListProps {
  onAddUser: () => void;
  onEditUser: (user: UserColumns | null ) => void;
  onDeleteUser: (user: UserColumns | null) => void;
  refreshKey: boolean
}

const UserList: FC<UserListProps> = ({ onAddUser, onEditUser, onDeleteUser, refreshKey }) => {
const [loadingUsers, setLoadingUsers] = useState(false)
const [users, setUsers] = useState<UserColumns[]>([])
const [usersTableCurrentPage, setUsersTableCurrentPage] = useState(1)
const [usersTableLastPage, setUsersTableLastPage] = useState(1)
const [hasMore, setHasMore] = useState(true)

const [search,setSearch] = useState('')
const [debouncedSearch, setDebouncedSearch] = useState('')

const tableRef = useRef<HTMLDivElement>(null)

const handleLoadUsers = async (page: number, append = false ,search: string) => {
  try{
    setLoadingUsers(true)

    const response = await UserService.loadUsers(page, search)

    if(response.status === 200) {
      const usersData = response.data.users.data || response.data.users || []
      const lastPage = response.data.users.last_page || response.data.last_page || usersTableLastPage || 1

      setUsers(append ? [...users, ...usersData] : usersData);
      setUsersTableCurrentPage(page);
      setUsersTableLastPage(lastPage);
      setHasMore(page < lastPage);


    }else {
      setUsers(append ? users : []);
      setHasMore(false);
    }
  }catch(error) {
    console.error('Unexpected server error occured during loading users:', error)
  }finally {
    setLoadingUsers(false)
  }
};

const handleScroll = useCallback(() => {
  const ref = tableRef.current
  if(ref && ref.scrollTop + ref.clientHeight >= ref.scrollHeight - 10 && hasMore && !loadingUsers) {
    handleLoadUsers(usersTableCurrentPage + 1, true, debouncedSearch)
  }
}, [hasMore, loadingUsers, usersTableCurrentPage]);

const handleUserFullNameFormat = (user: UserColumns) => {
  let fullName = ''

  if (user.middle_name) {
    fullName = `${user.last_name} ${user.first_name} ${user.middle_name.charAt(0)}`
  } else {
    fullName = `${user.last_name} ${user.first_name}`
    
  }
  if (user.suffix_name) {
    fullName += ` ${user.suffix_name}`
  }
  return fullName
}

useEffect(() => {
  const ref = tableRef.current
  if(ref) {
    ref.addEventListener('scroll', handleScroll)
  }
  return () => {
    if(ref) {
      ref.removeEventListener('scroll', handleScroll)
    }
  }
}, [handleScroll])

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search)
  }, 800);
  return () => clearTimeout(timer)
}, [search])


useEffect(() => {
  setUsers([])
  setUsersTableCurrentPage(1)
  setHasMore(true)

  handleLoadUsers(1, false, debouncedSearch);
}, [refreshKey, debouncedSearch])


  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div 
        ref={tableRef}
        className="relative max-w-full max-h-[calc(100vh-8.5rem)] overflow-x-auto">
          <Table>
            <caption className="mb-0">
              <div className="border-b border-gray-100">
                <div className="flex justify-between p-4">
                  <div className="w-64">
                    <FloatingLabelInput label="Search" type="text" name="search" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
                  </div>
                  <button
                    type="button"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 cursor-pointer"
                    onClick={onAddUser}
                  >
                    Add User
                  </button>
                </div>
              </div>
            </caption>
            <TableHeader className="sticky top-0 z-10 bg-blue-600 text-xs text-white">
              <TableRow>
                <TableCell
                  isHeader
                  colSpan={2}
                  className="px-5 py-3 text-center font-semibold tracking-wide"
                >
                  No.
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left font-semibold tracking-wide"
                >
                  Full Name
                </TableCell>
                
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left font-semibold tracking-wide"
                >
                  Gender
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left font-semibold tracking-wide"
                >
                  Birth Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left font-semibold tracking-wide"
                >
                  Age
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-center font-semibold tracking-wide"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 text-sm text-gray-600">
              {(users.length ?? 0) > 0 ? (
                users.map((user, index) => (
                  <TableRow className="bg-white transition hover:bg-gray-50" key={index}>
                    <TableCell className="px-5 py-3 text-center">
                      {index + 1}
                    </TableCell>
                    <TableCell className='py-3 items-end justify-end '>   
                      {user.profile_picture? (
                        <img src={user.profile_picture} alt={handleUserFullNameFormat(user)} className='object-cover w-10 h-10 rounded-full' />
                      ):(
                        <div className="relative inline-flex items-center justify-center w-10 h-10 text-cent text-sm overflow-hidden bg-gray-300 rounded-full">
                          <span className='font-medium text-gray-600'>
                            {`${user.last_name.charAt(0)}
                            ${user.first_name.charAt(0)}`}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-left">
                      {handleUserFullNameFormat(user)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-left">
                      {user.gender?.gender ?? 'N/A'}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-left">
                      {user.birth_date}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-left">
                      {user.age}
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <div className="flex items-center justify-center gap-4">
                        <button 
                        type="button" 
                        className="text-sm font-semibold text-green-600 hover:text-green-700"
                        onClick={() => onEditUser(user)}
                        >
                          Edit
                        </button>
                        <button 
                        type="button" 
                        className="text-sm font-semibold text-red-600 hover:text-red-700"
                        onClick={() => onDeleteUser(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                 ))
              ): !loadingUsers && (users.length ?? 0) <= 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-5 text-center font-medium">
                    NO USERS FOUND
                  </TableCell>
                </TableRow>
              ):(
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-5 text-center">
                    <Spinner size="md"/>
                  </TableCell>
                </TableRow>
                
              )}

              {loadingUsers && (users.length ?? 0) > 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-5 text-center">
                    <Spinner size="md"/>
                  </TableCell>
                </TableRow>
              )}

            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default UserList;
