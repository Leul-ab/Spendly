import { createCategory, getCategories, updateCategory, deleteCategory } from "../service/category.service.js";

//create category
export const create = async (req, res) =>{
    try{
        const category = await createCategory(req.body.name, req.user.id);
        res.status(201).json({message: "Category created successfully", data: category});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

//get all categories
export const getAll = async (req, res) =>{
    try{
        const categories =await getCategories(req.user.id);
        res.status(200).json(categories);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

//update category
export const update = async (req, res) =>{
    try{
        const category = await updateCategory(req.params.id, req.body.name, req.user.id);
        res.status(200).json({ message: "Category updated successfully", data: category });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

//delete category
export const remove = async (req, res) =>{
    try{
        const deleted = await deleteCategory(req.params.id, req.user.id);
        res.status(200).json({ message: "Category deleted successfully", data: deleted });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}