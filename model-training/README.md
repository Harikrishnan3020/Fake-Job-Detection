# Fake Job Detector Model Training

This folder contains a minimal RoBERTa-base fine-tuning script for fake vs real job postings.

## Files

- `train_roberta_fake_jobs.py` — training script using `roberta-base` as backbone.
- `data/example_train.csv` — example data format: columns `text` and `label` (0 = real, 1 = fake).

## Expected data

Create two CSV files under `data/`:

- `train.csv`
- `valid.csv`

Both with headers:

```csv
text,label
...
```

Where:
- `text` is the full job description.
- `label` is `0` for real / legitimate jobs, `1` for fake / scam jobs.

## Setup

1. Create and activate a Python environment.
2. Install dependencies:

```bash
pip install transformers datasets accelerate scikit-learn huggingface_hub
```

3. Log in to Hugging Face Hub:

```bash
huggingface-cli login
```

4. Edit `HUB_MODEL_ID` in `train_roberta_fake_jobs.py` to your desired repo id, e.g.:

```python
HUB_MODEL_ID = "your-username/roberta-fake-job-detector"
```

5. Prepare your `train.csv` and `valid.csv` following the format.

6. Run training from this folder:

```bash
python train_roberta_fake_jobs.py
```

After training finishes, the best model is pushed to the Hub and can be used from your React app by setting `HF_MODEL_ID` to the same repo id.
