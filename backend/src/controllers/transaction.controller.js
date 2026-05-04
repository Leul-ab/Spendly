import { createTransaction, getTransaction, deleteTransaction, updateTransaction } from "../service/transaction.service.js";

//create
export const create = async (req, res) =>{
    try{
        const transaction = await createTransaction(req.body, req.user.id);
        res.status(201).json({message: "Transaction created", data: transaction,});
    }catch (error){
        res.status(500).json({message: "Error creating transaction", error: error.message,});
    }
};

//get all
export const getAll = async (req, res) => {
  try {
    const result = await getTransaction(
      req.user.id,
      req.query
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


//update
export const update = async (req, res) =>{
    try{
        const transaction = await updateTransaction(req.params.id, req.body, req.user.id);
        res.status(200).json({message: "Transaction updated", data: transaction,});
    }catch (error){
        res.status(400).json({message: error.message});
    }
};

//delete
export const remove = async (req, res) =>{
    try{
        const transaction = await deleteTransaction(req.params.id, req.user.id);

        res.status(200).json({message: "Transaction deleted", data: transaction,});
    }catch (error){
        res.status(400).json({message: error.message});
    }
};