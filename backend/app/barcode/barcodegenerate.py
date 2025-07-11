import barcode
from barcode.writer import ImageWriter
import os
from app.models import Order, OrderStatusEnum

def generate_order_barcode(order_id: int) -> str:
    code = str(order_id).zfill(12)
    if len(code) != 12 or not code.isdigit():
        raise ValueError("Order ID must be numeric and 12 digits long after zero-filling")
    # Путь для сохранения: static/barcodes
    output_dir = os.path.join(os.getcwd(), 'static', 'barcodes')
    os.makedirs(output_dir, exist_ok=True)  # Создаст папку, если её нет[1][2][3]
    EAN = barcode.get_barcode_class('ean13')
    ean = EAN(code, writer=ImageWriter())
    filename = os.path.join(output_dir, f'order_{order_id}')
    try:
        fullname = ean.save(filename)
    except Exception as e:
        print(f"Ошибка генерации штрих-кода: {e}")
        raise
    # Возвращаем относительный путь для фронта
    rel_path = f'/static/barcodes/order_{order_id}.png'
    return rel_path



# Пример использования в асинхронной функции (например, при создании заказа)
async def create_order_and_generate_barcode(db, current_user):
    order = Order(user_id=current_user.id, status=OrderStatusEnum.ORDERED)
    db.add(order)
    await db.commit()
    await db.refresh(order)

    # Генерируем штрихкод и сохраняем путь в поле order.barcode
    barcode_path = generate_order_barcode(order.id)
    order.barcode = barcode_path
    db.add(order)
    await db.commit()
    await db.refresh(order)

    return order
