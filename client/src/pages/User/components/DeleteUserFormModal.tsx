import { useEffect, useState, type FormEvent } from "react"
import Modal from "../../../components/Modal"
import type { UserColumns } from "../../../interfaces/UserInterface"
import CloseButton from "../../../components/Button/CloseButton"
import SubmitButton from "../../../components/Button/SubmitButton"
import UserService from "../../../services/UserService"


interface DeleteUserFormModalProps {
    user : UserColumns|null
    onUserDeleted: (message:string) => void
    refreshKey: () => void
    isOpen: boolean
    onClose: () => void
}

const DeleteUserFormModal: React.FC<DeleteUserFormModalProps> = ({ user, onUserDeleted, refreshKey, isOpen, onClose }) => {

        const[loadingDestroy, setLoadingDestroy] = useState(false)
        const[firstName, setFirstName] = useState("")
        const[middleName, setMiddleName] = useState("")
        const[lastName, setLastName] = useState("")
        const[suffixName, setSuffixName] = useState("")
        const[gender, setGender] = useState("")
        const[birthDate, setBirthDate] = useState("")
        const[username, setUsername] = useState("")

        const handleDestroyUser = async (e:FormEvent) => {
            try {
                e.preventDefault()
                setLoadingDestroy(true)

                const res = await UserService.destroyUser(user?.user_id!)

                if(res.status === 200) {
                    onUserDeleted(res.data.message)
                    refreshKey()
                    onClose()
                } else {
                    console.error('Unexpected status error occured during deleting user:', res.status)
                }
            } catch (error) {
                console.error('Unexpected error occured during deleting user:', error)
            } finally {
                setLoadingDestroy(false)
            }
        }

    useEffect(() => {
        if (isOpen){
            if(user){
            setFirstName(user.first_name)
            setMiddleName(user.middle_name ?? "")
            setLastName(user.last_name)
            setSuffixName(user.suffix_name ?? "")
            setGender(user.gender.gender)
            setBirthDate(user.birth_date)
            setUsername(user.username)
        }else {
            console.error('unexpected error occured during loading user data: user data is null or undefined: ', user)
        }
        }
        

    },[isOpen, user])        

  return (
    <>
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleDestroyUser}>
            <h1 className="text-2xl border-b border-gray-100 p-4 font-semibold mb-4 ">
                Delete User Form
            </h1>
            <div className="grid grid-cols-2 gap-4 border-b border-gray-100 mb-4">
                <div className="col-span-2 md:col-span-1">
                    <div className="mb-4">
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                            First Name
                        </label>
                        <p className="mt-1 text-sm text-gray-500">{firstName}</p>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700">
                            Middle Name
                        </label>
                        <p className="mt-1 text-sm text-gray-500">{middleName || 'N/A'}</p>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                            Last Name
                        </label>
                        <p className="mt-1 text-sm text-gray-500">{lastName}</p>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="suffix_name" className="block text-sm font-medium text-gray-700">
                            Suffix Name
                        </label>
                        <p className="mt-1 text-sm text-gray-500">{suffixName || 'N/A'}</p>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                            Gender
                        </label>
                        <p className="mt-1 text-sm text-gray-500">{gender}</p>
                    </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                    <div className="mb-4">
                        <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                            Birth Date
                        </label>
                        <p className="mt-1 text-sm text-gray-500">{birthDate}</p>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <p className="mt-1 text-sm text-gray-500">{username}</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                {!loadingDestroy && (

                <CloseButton label="Close" onClose={onClose} />
                )}
                <SubmitButton className="bg-red-500 hover:bg-red-600 text-white" label="Delete User" loading={loadingDestroy} loadingLabel="Deleting User..." />
            </div>
            </form>
        </Modal>
    </>
  )
}

export default DeleteUserFormModal