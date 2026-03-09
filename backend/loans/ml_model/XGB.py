import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle

df = pd.read_csv("user_financial_dataset_realistic.csv")

df.head()

le = LabelEncoder()
df["risk"] = le.fit_transform(df["risk"])

X = df.drop("risk", axis=1)
y = df["risk"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


model = xgb.XGBClassifier(
    objective="multi:softmax",
    num_class=3,
    n_estimators=300,
    learning_rate=0.05,
    max_depth=6,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)


accuracy = accuracy_score(y_test, y_pred)

print("\n Accuracy:", accuracy)

print("\n Classification Report:")
print(classification_report(y_test, y_pred, target_names=le.classes_))

print("\n Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))



input_data = {
    'years_as_customer' : int(input("How many years are you with this bank ?")),
    'total_transaction_amount' : int(input("Total Transaction amount")),
    'total_loan_amount' : int(input("Total loan")),
    'tenure_months' : int(input("Tenure")),
    'income' : int(input("Annual Income")), 
    'pending_loan' : int(input("Any pending loans?")),
    'fixed_deposits' : int(input("Fixed deposit amount")),
    'credit_score' : int(input("Credit score"))
}


input_df = pd.DataFrame([input_data])


prediction = model.predict(input_df)


predicted_label = le.inverse_transform(prediction)

print("\nRisk:", predicted_label[0])




with open('risk_model.pkl', 'wb') as f:
    pickle.dump(model, f)


with open('label_encoder.pkl', 'wb') as f:
    pickle.dump(le, f)

print("Models saved successfully!")