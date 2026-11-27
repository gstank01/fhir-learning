#!/usr/bin/env python3
"""Convert tables from an R4 resource page into Markdown for this site.

Usage:
  curl -s -o /tmp/procedure.html https://hl7.org/fhir/R4/procedure.html
  python3 tools/spec_to_markdown.py /tmp/procedure.html structure   > structure.md
  python3 tools/spec_to_markdown.py /tmp/procedure.html bindings    > bindings.md
  python3 tools/spec_to_markdown.py /tmp/procedure.html search      > search.md
  python3 tools/spec_to_markdown.py /tmp/procedure.html constraints > constraints.md

"structure" gives the structure table with the site's element icons
(public/img/fhir/), indentation and links to the spec. "bindings" and
"search" give the Terminology Bindings and Search Parameters tables.
Links are made absolute (https://hl7.org/fhir/R4/...).
"""
import html
import re
import sys

BASE = 'https://hl7.org/fhir/R4/'
ICON_ALT = {
    'icon_resource.png': 'Resource', 'icon_element.gif': 'Backbone element', 'icon_choice.gif': 'Choice of types',
    'icon_primitive.png': 'Primitive type', 'icon_datatype.gif': 'Complex type', 'icon_reference.png': 'Reference',
    'icon_reuse.png': 'Reuse', 'icon_slice.png': 'Slice', 'icon_extension_simple.png': 'Extension',
    'icon_extension_complex.png': 'Complex extension', 'icon_modifier_extension_simple.png': 'Modifier extension',
    'icon_modifier_extension_complex.png': 'Complex modifier extension', 'icon_profile.png': 'Profile',
}


def absolute(href):
    href = html.unescape(href)
    if href.startswith(('http://', 'https://')):
        return href
    if href.startswith('#'):
        # In-page link to an element, e.g. #ConceptMap.group.element.target.dependsOn:
        # point it at the resource's definitions page, which has the same anchors.
        resource = href[1:].split('.')[0]
        return f'{BASE}{resource.lower()}-definitions.html{href}'
    return BASE + href.lstrip('./')


def to_md(fragment):
    """Turn a table cell's HTML into one line of Markdown."""
    s = re.sub(r'<a name="[^"]*">\s*</a>', '', fragment)
    s = re.sub(r'<img[^>]*>', '', s)
    s = re.sub(r'<br\s*/?>', '\u0001', s)  # keep line breaks as <br>
    links = []

    def link(m):
        text = re.sub(r'<[^>]+>', '', m.group(2))
        text = html.unescape(text).strip()
        links.append(f'[{text}]({absolute(m.group(1))})')
        return f'\u0002{len(links) - 1}\u0003'

    s = re.sub(r'<a [^>]*?href="([^"]+)"[^>]*>(.*?)</a>', link, s, flags=re.S)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s)
    s = re.sub(r'\s+', ' ', s).strip()
    s = s.replace('|', '\\|')
    s = re.sub('\u0002(\\d+)\u0003', lambda m: links[int(m.group(1))], s)
    s = re.sub(r'\)\[', ') [', s)  # space between adjacent links (flags)
    s = s.replace('\u0001', '<br>')
    s = re.sub(r'(\s*<br>\s*)+$', '', s)
    s = re.sub(r'\s*<br>\s*', '<br>', s)
    return s


def structure(page):
    i = page.find('id="tbl-inner"')
    if i < 0:
        i = page.find('class="hierarchy"')
    table = page[i:page.find('</table>', i)]
    out = ['| Name | Flags | Card. | Type | Description & Constraints |', '|---|---|---|---|---|']
    for row in re.findall(r'<tr[^>]*>(.*?)</tr>', table, re.S):
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.S)
        if len(cells) < 5:
            continue
        name_html = cells[0]
        level = max(0, len(re.findall(r'src="tbl_', name_html)) - 1)
        icon = re.search(r'src="(icon_[^"]+)"', name_html)
        icon_md = ''
        if icon:
            alt = ICON_ALT.get(icon.group(1), 'Element')
            icon_md = f'![{alt}](img/fhir/{icon.group(1)}) '
        name = to_md(name_html)
        if level == 0:
            name = f'**{name}**'
        desc = to_md(cells[4])
        out.append(f"| {'&emsp;' * level}{icon_md}{name} | {to_md(cells[1])} | {to_md(cells[2])} | {to_md(cells[3])} | {desc} |")
    return '<div class="structure-table">\n\n' + '\n'.join(out) + '\n\n</div>'


def grid_after(page, heading):
    """The first 'grid' table after a heading containing the given text."""
    h = re.search(r'<h[2-4][^>]*>(?:(?!</h).)*' + re.escape(heading), page, re.S)
    if not h:
        raise SystemExit(f'Heading not found: {heading}')
    i = page.find('<table', h.end())
    table = page[i:page.find('</table>', i)]
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table, re.S)
    md = []
    for n, row in enumerate(rows):
        cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.S)
        if not cells:
            continue
        line = '| ' + ' | '.join(to_md(c) or ' ' for c in cells) + ' |'
        md.append(line)
        if n == 0:
            md.append('|' + '---|' * len(cells))
    return '<div class="spec-table">\n\n' + '\n'.join(md) + '\n\n</div>'


if __name__ == '__main__':
    page = open(sys.argv[1], encoding='utf-8').read()
    what = sys.argv[2]
    if what == 'structure':
        print(structure(page))
    elif what == 'bindings':
        print(grid_after(page, 'Terminology Bindings'))
    elif what == 'search':
        print(grid_after(page, 'Search Parameters'))
    elif what == 'constraints':
        print(grid_after(page, 'Constraints'))
    else:
        raise SystemExit('Choose structure, bindings, constraints or search')
