const Modal = {
 
    openAndClose() {
        //abrir modal
        //adicionar a classe active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .toggle('active')
    }    
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },

    set(transaction){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transaction))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transactions) {
        Transaction.all.push(transactions)
        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes(){
        let income = 0
        //pegar todas as transações
        Transaction.all.forEach(transaction => {
            //se for maior que  zero
            if (transaction.amount > 0) {
                //somar a variavel 
                income += transaction.amount
            }
        })
        //retornar a variavel
        return income
    },

    expenses(){
        let expense = 0
        //pegar todas as transações
        Transaction.all.forEach(transaction => {
            //se for menor que zero
            if(transaction.amount < 0) {
                //somar a variavel de saida
                expense += transaction.amount
            }
        })
        //retornar a variavel
        return expense
    },

    total(){
        return Transaction.incomes() + Transaction.expenses()
    },

}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
        </td>
        `

        return html
    },

    updateBalance() {   
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())    
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatDate(value){
        const splitedDate = value.split("-")
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
    },
    formatAmount(value) {
        value = Number(value) * 100
        return value
    },
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + " " +value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateField(){
        const { description, amount, date} = Form.getValues()
        
        if(
            description.trim() === "" || 
            amount.trim() ==="" || 
            date.trim() ===""){
                throw new Error("Por favor, preencha todos os campos")
        }

    },

    formatValues(){
        let { description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try{
            //verificar se todas as informações foram preenchidas
            Form.validateField()
            //formatar os dados para salvar
            const transaction = Form.formatValues()
            //salvar e atualizar a aplicação
            Transaction.add(transaction)
            //apagar os dados do formulario
            Form.clearFields()
            //modal fechar
            Modal.openAndClose()
            
        } catch (error){
            alert(error.message)
        }
    }
}

const App = {
    init(){
        Transaction.all.forEach(transaction => {
            DOM.addTransaction(transaction)
        })
        
        DOM.updateBalance()
        
        Storage.set(Transaction.all)
    },

    reload(){
        DOM.clearTransactions()
        App.init()
    }
}

App.init()