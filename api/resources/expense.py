from flask import request, g
from flask_restful import Resource
from api.models.expense import Expense

class ExpenseResource(Resource):
    def post(self):
        data = request.get_json()
        new_expense = Expense(_id=g.expense, **data)

        if Expense.find_by_id(g.expense):
            return {'message': 'Expense already exists'}, 400

        new_expense.save_to_db()
        return new_expense.json(), 201

    def get(self):
        expense = Expense.find_by_id(g.expense)

        if expense is None:
            return {'message': 'Expense not found'}, 404

        return expense.json(), 200

    def put(self):
        data = request.get_json()
        expense = Expense.find_by_id(g.expense)

        if expense is None:
            return {'message': 'Expense not found'}, 404

        expense.update_entry(data)
        return expense.json(), 200

    def delete(self):
        expense = Expense.find_by_id(g.expense)

        if expense is None:
            return {'message': 'Expense not found'}, 404

        expense.delete_by_id(g.expense)
        return {'message': 'Expense deleted'}, 200 