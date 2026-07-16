import urllib.request, json
try:
    res = urllib.request.urlopen('http://localhost:8000/api/kost/3b103784-15ec-46d7-ae44-b05c3f29d960')
    print(json.loads(res.read()))
except Exception as e:
    print("ERROR:", e)
    if hasattr(e, 'read'):
        print(e.read().decode())
