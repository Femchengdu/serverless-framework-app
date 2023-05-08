import * as AWS from 'aws-sdk'
import { DocumentClient, } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';


const logger = createLogger('TodosAccess')


export class TodosAccess {

    private readonly dynamoDBClient: DocumentClient
    private readonly todosTable: string

    constructor() {

        this.dynamoDBClient = new AWS.DynamoDB.DocumentClient()
        this.todosTable = 'Todos-dev'
    }

    async getUserTodos(userId: string): Promise<TodoItem[]> {

        const userTodos = await this.dynamoDBClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        return userTodos.Items as TodoItem[]

    }

    async createUserTodo(todoRequest): Promise<{}> {
        await this.dynamoDBClient.put({
            TableName: this.todosTable,
            Item: todoRequest
        }).promise()
        const result = {
            ...todoRequest,
        }

        return result
    }

    async updateUserTodo(updateObj: TodoUpdate, todoId: string, userId: string): Promise<{}> {
        // query for a particular todo
        const userTodo = await this.dynamoDBClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId and todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise()
        try {

            if (!userTodo.Count) {
                throw new Error("The todo does not exist")
            }
            // object is found here now update the object
            const { name, dueDate, done } = updateObj
            await this.dynamoDBClient.update({
                TableName: this.todosTable,
                Key: { userId, todoId },
                UpdateExpression: "SET #name = :val_name, #dueDt = :val_dueDt, #done = :val_done",
                ExpressionAttributeValues: {
                    ':val_name': name,
                    ':val_dueDt': dueDate,
                    ':val_done': done,
                },
                ExpressionAttributeNames: {
                    '#name': "name",
                    '#dueDt': "dueDate",
                    '#done': "done",
                }
            }).promise()
            return
        } catch (error) {
            logger.error("Todo update error :", {
                errorMsg: error.message
            })
        }
    }

    async deleteteUserTodo(todoId: string, userId: string): Promise<{}> {
        // query for a particular todo
        const userTodo = await this.dynamoDBClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId and todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise()
        try {

            if (!userTodo.Count) {
                throw new Error("The todo does not exist")
            }
            // object is found here now update the object

            await this.dynamoDBClient.delete({
                TableName: this.todosTable,
                Key: { userId, todoId }
            }).promise()

            return
        } catch (error) {
            logger.error("Todo delete error :", {
                errorMsg: error.message
            })
        }
    }
}