import numpy as np
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
)
from sklearn.metrics import accuracy_score, f1_score


MODEL_NAME = "roberta-base"
NUM_LABELS = 2  # 0 = real, 1 = fake
TRAIN_FILE = "data/train.csv"
VALID_FILE = "data/valid.csv"
HUB_MODEL_ID = "your-username/roberta-fake-job-detector"  # change to your HF repo id


def load_data():
    dataset = load_dataset(
        "csv",
        data_files={"train": TRAIN_FILE, "validation": VALID_FILE},
    )
    return dataset


def tokenize_function(examples, tokenizer):
    return tokenizer(
        examples["text"],
        truncation=True,
        padding="max_length",
        max_length=256,
    )


def prepare_dataset(dataset, tokenizer):
    tokenized = dataset.map(
        lambda batch: tokenize_function(batch, tokenizer), batched=True
    )
    tokenized = tokenized.rename_column("label", "labels")
    tokenized.set_format(
        type="torch",
        columns=["input_ids", "attention_mask", "labels"],
    )
    return tokenized


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return {
        "accuracy": accuracy_score(labels, preds),
        "f1_macro": f1_score(labels, preds, average="macro"),
    }


def main():
    print("Loading dataset...")
    raw_dataset = load_data()

    print("Loading tokenizer and model...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=NUM_LABELS,
    )

    print("Tokenizing dataset...")
    tokenized_dataset = prepare_dataset(raw_dataset, tokenizer)

    training_args = TrainingArguments(
        output_dir="roberta-fake-jobs",
        evaluation_strategy="epoch",
        save_strategy="epoch",
        logging_strategy="steps",
        logging_steps=50,
        num_train_epochs=3,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=16,
        learning_rate=2e-5,
        weight_decay=0.01,
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        push_to_hub=True,
        hub_model_id=HUB_MODEL_ID,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
        eval_dataset=tokenized_dataset["validation"],
        compute_metrics=compute_metrics,
    )

    print("Starting training...")
    trainer.train()

    print("Pushing best model to Hugging Face Hub...")
    trainer.push_to_hub()


if __name__ == "__main__":
    main()
