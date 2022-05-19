const router = require("express").Router();
const Person = require("../models/Person");

router.post("/", async (req, res) => {
  const { name, salary, approved } = req.body;

  if (!name || !salary || !approved) {
    return res.status(422).json({ error: "Missing fields" });
  }

  const person = {
    name,
    salary,
    approved,
  };

  try {
    await Person.create(person);

    res.status(201).json({ message: "Person created successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get('/', async (req, res) => {
  try {
    const people = await Person.find();
    res.status(200).json(people);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const person = await Person.findOne({ _id: id });

    if(!person) {
      return res.status(422).json({message: "Person not found"});
    }

    res.status(200).json(person);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, salary, approved } = req.body;

  const person = {
    name,
    salary,
    approved
  };

  try {
    const updatedPerson = await Person.updateOne({_id: id}, person);    
    if (updatedPerson.matchedCount === 0) {
      return res.status(422).json({ message: "Person not found" });
    }

    return res.status(200).json(person);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const person = await Person.find({ _id: id });

  if (!person) {
    return res.status(422).json({ message: "Person not found" });
  }

  try{
    await Person.deleteOne({ _id: id });
    res.status(200).json({message: "Person deleted successfully"});
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
