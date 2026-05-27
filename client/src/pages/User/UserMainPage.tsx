import { useModal } from '../../hooks/useModal';
import { useToastMessage } from '../../hooks/useToastMessage';
import AddUserFormModal from './components/AddUserFormModal';
import UserList from './components/UserList';
import ToastMessage from '../../components/ToastMessage/ToastMesaage';
import EditUserFormModal from './components/EditUserFormModal';
import { useRefresh } from '../../hooks/useRefresh';
import DeleteUserFormModal from './components/DeleteUserFormModal';

const UserMainPage = () => {
  const { isOpen: isAddOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal(false);
  const { isOpen: isEditOpen, selectedUser: selectedUserForEdit , openModal: openEditModal, closeModal: closeEditModal } = useModal(false);

  const { isOpen: isDeleteFormModalOpen, selectedUser: selectedUserForDelete , openModal: openDeleteUserFormModal, closeModal: closeDeleteUserFormModal } = useModal(false);

  const {message: toastMessage, isVisible: toastMessageIsVisible, showToastMessage, closeToastMessage,} = useToastMessage('', false,false);

  const { refresh , handleRefresh} = useRefresh(false)

  return (
    <>
        <ToastMessage message={toastMessage} isVisible={toastMessageIsVisible} onClose={closeToastMessage}/>

        <AddUserFormModal isOpen={isAddOpen} refreshKey={handleRefresh} onClose={closeAddModal} onUserAdded={showToastMessage} />

        <UserList onAddUser={openAddModal} onEditUser={(user) => openEditModal(user)} onDeleteUser={(user) => openDeleteUserFormModal(user)} refreshKey={refresh} />

        <DeleteUserFormModal user={selectedUserForDelete} onUserDeleted={showToastMessage} refreshKey={handleRefresh} isOpen={isDeleteFormModalOpen} onClose={closeDeleteUserFormModal} />

        <EditUserFormModal user={selectedUserForEdit} onUserUpdate={showToastMessage} refreshKey={handleRefresh} isOpen={isEditOpen} onClose={closeEditModal} />

      
      </>
    );
  };

  export default UserMainPage;
