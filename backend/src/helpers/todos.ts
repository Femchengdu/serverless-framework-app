import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger("Todo Biz Logic");
const TodoAccessInstance = new TodosAccess()

export const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {
    const results = await TodoAccessInstance.getUserTodos(userId)
    return results;
}

export const createTodo = async (userId: string, todoRequest: CreateTodoRequest): Promise<{}> => {
    const todoId: string = uuid.v4()
    const createdAt = new Date().toISOString()
    const newTodo = {
        todoId,
        userId,
        createdAt,
        done: false,
        ...todoRequest,
        attachmentUrl: ""
    }
    const results = await TodoAccessInstance.createUserTodo(newTodo)
    return results;
}

export const updateTodo = async (updateObj: UpdateTodoRequest, todoId: string, userId: string) => {
    await TodoAccessInstance.updateUserTodo(updateObj, todoId, userId)
}
export const deleteTodo = async (todoId: string, userId: string) => {
    await TodoAccessInstance.deleteteUserTodo(todoId, userId)
}

export const createAttachmentPresignedUrl = async (imageId: string) => {
    logger.info("Todos Image Id received :", { imageId })
    const s3AttachmentClient = new AttachmentUtils()

    return await s3AttachmentClient.returnPresignedUrl(imageId)

}
